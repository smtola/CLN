# Network Connection Issue Diagnosis

## Problem Summary

- **Domain**: `clncambodia.com` resolves to IP `162.210.96.117` ✓
- **Home Network**: Connection times out ✗
- **4G Mobile**: Works fine ✓
- **Conclusion**: Network-specific issue, not a website problem

## Diagnosis Results

```
DNS Resolution: ✓ Working (162.210.96.117)
Ping: ✗ Timeout (100% packet loss)
HTTPS Connection: ✗ Timeout (port 443 blocked/timed out)
Traceroute: Shows routing through ISP but times out mid-route
```

## Possible Causes

### 1. **ISP Blocking/Routing Issue** (Most Likely)
Your internet service provider (ISP) may be:
- Blocking connections to the server IP
- Having routing issues to the destination server
- Implementing content filtering that blocks the domain
- Experiencing network congestion/pe这条路ing issues

### 2. **Firewall Blocking Your IP**
The hosting server might be blocking your home IP address:
- DDoS protection systems blocking suspicious IP ranges
- IP-based access controls on the server
- Geographic restrictions

### 3. **Router/Network Firewall**
Your home router or network firewall might be:
- Blocking outbound HTTPS connections
- Blocking the specific IP range
- Having port filtering enabled

### 4. **Geographic/IP Range Filtering**
Some hosting providers block certain IP ranges:
- IP reputation databases flagging your ISP's IP range
- Security measures blocking entire ISP networks

## Solutions to Try

### Solution 1: Check with Your ISP
Contact your internet service provider and report:
- Domain: `clncambodia.com`
- IP: `162.210.96.117`
- Port: 443 (HTTPS)
- Issue: Connection timeout from your network

Ask them to:
- Check if they're blocking or filtering this connection
- Verify routing to this IP address
- Check for any DDoS protection or security measures affecting your IP

### Solution 2: Check with Hosting Provider
Contact your website hosting provider and:
- Ask if your home IP address is blocked
- Request they whitelist your IP if it's being blocked
- Check server firewall logs for blocked connections from your IP
- Verify server firewall allows connections from your ISP's IP range

### Solution 3: Router/Network Settings
1. **Reboot your router** - Often fixes routing issues
2. **Check router firewall settings** - Temporarily disable to test
3. **Try direct connection** - Connect computer directly to modem (bypass router)
4. **Check router logs** - Look for blocked connections

### Solution 4: Use Alternative DNS
Your current DNS server: `192.168.1.1` (Router)

Try changing to public DNS servers:
- **Google DNS**: `8.8.8.8` and `8.8.4.4`
- **Cloudflare DNS**: `1.1.1.1` and `1.0.0.1`
- **OpenDNS**: `208.67.222.222` and `208.67.220.220`

**How to change DNS (macOS)**:
```bash
# Via System Settings:
System Settings → Network → Your Connection → Details → DNS
Add: 8.8.8.8, 8.8.4.4

# Or via Terminal (temporary):
sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4
```

### Solution 5: VPN Connection
If your IP is blocked, use a VPN:
- Connect via VPN from home
- This will use Terry different IP address
- If VPN works, confirms IP blocking issue

### Solution 6: Check for Proxy Settings
Ensure no proxy is configured that might interfere:
```bash
# Check current proxy settings
networksetup -getwebproxy Wi-Fi
networksetup -getsecurewebproxy Wi-Fi
```

## Quick Diagnostic Commands

Run these to gather more information:

```bash
# Get your public IP
curl ifconfig.me

# Test DNS resolution
nslookup clncambodia.com
dig clncambodia.com

# Test connectivity
ping -c 5 162.210.96.117
curl -v https://clncambodia.com

# Check routing
traceroute clncambodia.com

# Test with different DNS
nslookup clncambodia.com 8.8.8.8
```

## Information to Provide Support

When contacting your ISP or hosting provider, provide:

1. **Your Public IP**: Get with `curl ifconfig.me`
2. **DNS Server**: `192.168.1.1` (your router)
3. **Target Domain**: `clncambodia.com`
4. **Target IP**: `162.210.96.117`
5. **Port**: `443` (HTTPS)
6. **Error**: "Connection timeout after 75 seconds"
7. **Works on**: 4G mobile network
8. **Doesn't work on**: Home network IP

## Temporary Workaround

While fixing the network issue:
- Use 4G mobile hotspot for accessing the website
- Use VPN service
- Access from a different network location
- Use mobile data tethering

## Testing After Fix

Once you make changes, test with:
```bash
# Quick test
curl -I https://clncambodia.com

# Should return HTTP headers, not timeout
```

## Most Likely Solution

Based on the symptoms (works on 4G, doesn't work on home IP), the most likely causes are:

1. **60% probability**: ISP routing issue or IP blocking by hosting provider
2. **30% probability**: Your home IP is on a blocklist (DDoS protection)
3. **10% probability**: Router/firewall configuration issue

**Recommended Action**: 
1. First check with hosting provider about IP blocking
2. Then check with ISP about routing issues
3. Try changing DNS as a quick test

