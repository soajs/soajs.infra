
let client = require("soajs.infra/test/manual/client").client;
//
// Fetch all the pods
async function main() {
	return await client.api.v1.namespaces("chirpstack").persistentvolumeclaims("redisdata").get();
}
//get namespaces
main().then((service) => {
	
	console.log(JSON.stringify(service));
	
	
}).catch((err) => {
	console.log(err)
});

