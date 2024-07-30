import https from 'https'
import core from '@actions/core'

// https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action
// https://github.com/actions/toolkit/tree/main/packages/core
// domains for test:
// - normal: google.com
// - expired: httpforever.com
// - error: anydomaintest.io
// - no certificate: It should never happen

/**
 * Get SSL certificate
 * @param {string} domain
 * @returns {Promise<any>}
 */
const getSSLCertificate = (domain) => {
  return new Promise((resolve, reject) => {
    const options = { hostname: domain, port: 443, method: 'GET', agent: false }
    const request = https.request(options, response => {
      resolve(response.socket.getPeerCertificate())
    })
    request.on('error', reject)
    request.end()
  })
}

const main = async () => {
  try {
    const domain = core.getInput('domain', { required: true, trimWhitespace: true })
    const certificate = await getSSLCertificate(domain)
    if (certificate.valid_to) {
      const date = new Date(certificate.valid_to)
      const expireDate = date.toString()
      const remainingDays = Math.floor((date - new Date()) / (24 * 60 * 60 * 1000))
      core.info(`ssl-expire-date: ${expireDate}`)
      core.info(`ssl-expire-days-left: ${remainingDays} days`)
      core.setOutput("ssl-expire-date", expireDate)
      core.setOutput("ssl-expire-days-left", remainingDays)
    } else {
      core.setFailed(`Unable to get SSL-certificate expiration date for domain ${domain}`)
    }
  } catch (error) {
      if (error?.code === 'CERT_HAS_EXPIRED') {
      core.warning(`ssl-expire-date: INVALID`)
      core.warning(`ssl-expire-days-left: -1 (expired)`)
      core.setOutput("ssl-expire-date", "INVALID")
      core.setOutput("ssl-expire-days-left", -1)
    } else {
      core.setFailed(error)
    }
  }
}

main()