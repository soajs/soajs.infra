let client = require("../client-config").client;

let cmd = ['/bin/bash', '-c', 'cat package.json'];

// Fetch all the pods
async function main() {
	
	return await client.api.v1.namespaces("mathieu").pods("mathieu-oauth-v1-6f76874964-8qj57").exec.get({ //local
		qs: {
			stdout: 1,
			stdin: 1,
			stderr: 1,
			command: cmd
		}
	});
}

main().then((result) => {
	
	console.log(JSON.stringify(result));
	
}).catch((err) => {
	console.log(err)
});