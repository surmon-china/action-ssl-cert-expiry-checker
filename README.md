# SSL Certificate Watcher

Watch SSL certs expiring for your domains.

## Inputs

### `domain`

**Required**: The site domain to be checked (without protocol).

## Outputs

### `ssl-expire-date`

The expiration date of the SSL certificate.

### `ssl-expire-days-left`

The number of days left until the SSL certificate expires.

## Example Usage

```yaml
- name: Check domain SSL expire date
  id: check-ssl
  uses: surmon-china/action-check-ssl-certificate@v1
  with:
    domain: ${{ matrix.domain }}

- run: echo 'SSL cert has ${{ steps.check-ssl.outputs.ssl-expire-days-left }} days left'
  if: ${{ steps.check-ssl.outputs.ssl-expire-days-left }}
```

### Advanced Example

You can create a workflow based on this action to check your domains. This workflow will be scheduled by cron to run every day around 8:00 UTC (it might be slightly delayed due to GitHub’s scheduling).

If the SSL certificate’s lifespan (number of days) is below a specified limit (e.g., 10 days), it will create a new issue.

```yaml
name: Check domains

on:
  schedule:
    - cron: "0 8 * * *"

jobs:
  check-ssl:
    runs-on: ubuntu-latest
    name: Check domain SSL certificates
    strategy:
      matrix:
        domain:
          - github.com
          - surmon.me
    steps:
      - name: Check domain SSL and registry expire date
        id: check-ssl
        uses: surmon-china/action-check-ssl-certificate@v1
        with:
          domain: ${{ matrix.domain }}

      - name: Create an issue if SSL lifespan days number is below limit
        if: ${{ steps.check-ssl.outputs.ssl-expire-days-left < 10 }}
        uses: rishabhgupta/git-action-issue@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          title: 🧨 ${{ matrix.domain }} — SSL cert expires in ${{ steps.check-ssl.outputs.ssl-expire-days-left }} days
          body: "Valid till: `${{ steps.check-ssl.outputs.ssl-expire-date }}`"
```
