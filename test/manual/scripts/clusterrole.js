
let client = require("../client").client;
//
// Fetch all the pods
async function main() {
	return await client.apis["rbac.authorization.k8s.io"].v1.clusterroles("system:aggregated-metrics-reader").get();
}
//get namespaces
main().then((service) => {
	
	console.log(JSON.stringify(service));
	
	
}).catch((err) => {
	console.log(err)
});

