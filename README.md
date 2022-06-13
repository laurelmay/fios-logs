# FiOS Gateway Log Fetching

This fetches the logs from a FiOS Gateway and writes them to a file locally.
The logs will be written to a `logs` directory in the current working directory.

## Running

Run the log fetcher by setting the `ADMIN_PASSWORD` environment variable to the
admin password for your FiOS Gateway. You can optionally set `GATEWAY_HOST` to the
IP address or hostname of your FiOS Gateway (by default, the value `myfiosgateway.com`
is used).

Run the script with:

```bash
npx ts-node src/get-logs.ts
```
