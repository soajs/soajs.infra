//kubectl exec -n soajs -it dashboard-infra-v1-5b96c5868b-9gttv -- /bin/bash
const WebSocket = require('ws');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let cmd = ['/bin/bash', '-c', 'pwd'];

let options = {
    "cmd": ['/bin/bash', '-c', 'pwd'],
    "uri": "0.0.0.0:443",
    "namespace": "dev",
    "podname": "dev-commerce-v1-779ccf68df-lzrbp",
    "token": "0.0-0"
}

uri = `wss://${options.uri}`;
uri += `/api/v1/namespaces/${options.namespace}/pods/${options.podname}/exec?`;
uri += 'stdout=1&stdin=1&stderr=1';
options.cmd.forEach(subCmd => uri += `&command=${encodeURIComponent(subCmd)}`);


let wsOptions = {};
wsOptions.payload = 1024;
wsOptions.headers = {
    'Authorization': `Bearer ${options.token}`
};

let ws = new WebSocket(uri, "base64.channel.k8s.io", wsOptions);

ws.on('error', (error) => {
    console.log("error", error);
});

let response = '';

ws.on('message', (data) => {
    // 1. Channel Check (MUST be 49 or 50, which are ASCII '1' and '2')
    const channel = data[0];

    // 2. Slice the Buffer to get ONLY the Base64 payload
    const base64Data = data.slice(1);

    if (channel === 49 || channel === 50) {

        // --- 🎯 Attempt the Double Conversion Fix here 🎯 ---
        const base64String = base64Data.toString('utf-8');
        let decodedChunk = Buffer.from(base64String, 'base64').toString('utf-8');

        // ----------------------------------------------------

        // Verify the immediate result with a dedicated log
        console.log("--- DEBUG: DECODED CHUNK ---");
        console.log(decodedChunk);
        console.log("----------------------------");

        response += decodedChunk;
    } else {
        // Log non-output channels
        try {
            const statusMessage = base64Data.toString('utf-8');
            console.log(`Received non-output message on channel ${channel}: ${statusMessage}`);
        } catch (e) {
            console.log(`Received raw non-output message on channel ${channel}`);
        }
    }
});

ws.on('close', () => {
    // This is the final, decoded output printed when the connection closes.
    console.log("--- Final Pod Command Output (Decoded) ---");
    console.log(response.trim()); // trim() removes any leading/trailing whitespace or newlines
    console.log("------------------------------------------");
});
