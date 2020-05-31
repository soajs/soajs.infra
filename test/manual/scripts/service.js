
let client = require("../client").client;
//
// Fetch all the pods
async function main() {
	return await client.api.v1.namespaces("kube-system").services("metrics-server").get();
}
//get namespaces
main().then((service) => {
	
	console.log(JSON.stringify(service));
	
	
}).catch((err) => {
	console.log(err)
});