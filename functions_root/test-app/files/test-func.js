

async function main(args, env, db) {

	const { "user_agents": userAgents } = await db.addCollections({
		"user_agents": {
			schema: {
				"title": "user_agents",
				"version": 0,
				"description": "A log of user agents",
				"type": "object",
				"properties": {
					"id": {
						type: "string",
						primary: true,
					},
					"userAgent": {
						type: "string",
					},
					"date": {
						type: "number"
					}
				}
			}
		}
	});



	await userAgents.insert({
		id: nanoid(6),
		userAgent: env.request.headers["user-agent"],
		date: Date.now(),
	});

	const allAgents = await userAgents.find().exec();


	return allAgents.map(agent => agent.toJSON());
}