
let client = require("../client").client;
//
// Fetch all the pods
async function main() {
	return await client.api.v1.namespaces("soajs").pods("dev-urac-v3-86d66b758c-lhcz8").get();
}
//get namespaces
main().then((service) => {
	
	console.log(JSON.stringify(service));
	
	
}).catch((err) => {
	console.log(err)
});

