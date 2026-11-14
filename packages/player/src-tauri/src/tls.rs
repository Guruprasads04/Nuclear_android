use reqwest::{Certificate, ClientBuilder};

const PEM_BEGIN: &str = "-----BEGIN CERTIFICATE-----";
const PEM_END: &str = "-----END CERTIFICATE-----";

#[cfg(target_os = "android")]
const SYSTEM_CA_DIRS: &[&str] = &[
    "/apex/com.android.conscrypt/cacerts",
    "/system/etc/security/cacerts",
];

pub fn extract_pem_blocks(text: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut rest = text;

    while let Some(start) = rest.find(PEM_BEGIN) {
        let after_start = &rest[start..];
        let Some(end) = after_start.find(PEM_END) else {
            break;
        };
        let block_end = end + PEM_END.len();
        blocks.push(after_start[..block_end].to_string());
        rest = &after_start[block_end..];
    }

    blocks
}

#[cfg(target_os = "android")]
fn read_certificates_from(dir: &str) -> Vec<Certificate> {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return Vec::new();
    };

    entries
        .filter_map(Result::ok)
        .filter_map(|entry| std::fs::read_to_string(entry.path()).ok())
        .flat_map(|contents| extract_pem_blocks(&contents))
        .filter_map(|block| Certificate::from_pem(block.as_bytes()).ok())
        .collect()
}

/// Android keeps its trusted roots outside the bundle that reqwest compiles in,
/// so a device that trusts an extra root - a company network that inspects
/// traffic, most often - fails every request here while the webview succeeds.
#[cfg(target_os = "android")]
pub fn system_root_certificates() -> Vec<Certificate> {
    SYSTEM_CA_DIRS
        .iter()
        .flat_map(|dir| read_certificates_from(dir))
        .collect()
}

#[cfg(not(target_os = "android"))]
pub fn system_root_certificates() -> Vec<Certificate> {
    Vec::new()
}

pub fn client_builder() -> ClientBuilder {
    let certificates = system_root_certificates();
    if !certificates.is_empty() {
        log::info!("[tls] Trusting {} system certificates", certificates.len());
    }

    certificates
        .into_iter()
        .fold(ClientBuilder::new(), |builder, certificate| {
            builder.add_root_certificate(certificate)
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIRST: &str = "-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----";
    const SECOND: &str = "-----BEGIN CERTIFICATE-----\nBBBB\n-----END CERTIFICATE-----";

    #[test]
    fn finds_nothing_in_empty_input() {
        assert!(extract_pem_blocks("").is_empty());
    }

    #[test]
    fn reads_a_certificate_followed_by_a_human_readable_dump() {
        let text = format!("{}\nIssuer: Example\nSubject: Example\n", FIRST);

        assert_eq!(extract_pem_blocks(&text), vec![FIRST.to_string()]);
    }

    #[test]
    fn reads_every_certificate_in_a_bundle() {
        let text = format!("{}\n{}\n", FIRST, SECOND);

        assert_eq!(
            extract_pem_blocks(&text),
            vec![FIRST.to_string(), SECOND.to_string()]
        );
    }

    #[test]
    fn ignores_a_truncated_certificate() {
        let text = format!("{}\n{}\nAAAA\n", FIRST, PEM_BEGIN);

        assert_eq!(extract_pem_blocks(&text), vec![FIRST.to_string()]);
    }

    #[test]
    fn builds_a_client() {
        assert!(client_builder().build().is_ok());
    }
}
