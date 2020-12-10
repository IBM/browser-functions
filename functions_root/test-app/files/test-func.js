

async function main(args, env, collections) {

	const { "user_agents": userAgents } = collections;



	await userAgents.insert({
		id: nanoid(6),
		userAgent: env.request.headers["user-agent"],
		date: Date.now(),
	});

	const allAgents = await userAgents.find().exec();


	return allAgents.map(agent => agent.toJSON());
}