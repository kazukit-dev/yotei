resource "cloudflare_dns_record" "web_cert" {
  type    = "CNAME"
  name    = var.web_cert.name
  content = var.web_cert.target
  zone_id = var.zone_id
  ttl     = 1
  proxied = false
}

resource "cloudflare_dns_record" "web_domain" {
  type    = "CNAME"
  name    = "@"
  content = var.web_origin_domain
  zone_id = var.zone_id
  ttl     = 1
  proxied = false
}

resource "cloudflare_dns_record" "api_cert" {
  type    = "CNAME"
  name    = var.api_cert.name
  content = var.api_cert.target
  zone_id = var.zone_id
  ttl     = 1
  proxied = false
}

resource "cloudflare_dns_record" "api_domain" {
  type    = "CNAME"
  name    = "api"
  content = var.api_origin_domain
  zone_id = var.zone_id
  ttl     = 1
  proxied = false
}
