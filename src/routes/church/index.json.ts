import { Church, sequelize } from '../../model/_index';
import bcrypt from 'bcryptjs';

const headers = {
	'Content-Type': 'application/json'
};

export const get: RequestHandler = async ({ query }) => {
	const opt: { attributes: string[]; where?: { id: number } } = {
		attributes: ['id', 'name', 'location', 'color', 'noParticipants']
	};

	console.log('HELLLLO', { opt, query });
	const id = + query.get('roomId');

	if (id) {
		opt.where = { id };
	}

	let churches: Church[] = [];
	try {
		churches = await Church.findAll(opt);
	} catch (e) {
		await sequelize.sync();
	}

	return {
		body: JSON.stringify(churches),
		headers
	};
};

export const post: RequestHandler = async ({ body }) => {
	let result = true;
	try {
		if (typeof body == 'string') {
			const params = new URLSearchParams(body);
			let data: ChurchType | {} = {};

			try {
				params.forEach(async (value, key, _) => {
					data[key] = value;
				});

				data.participantCode = await hashedCode(data.participantCode);
				data.adminCode = await hashedCode(data.adminCode);
			} catch (e) {
				console.log(e);
			}

			const church = await Church.create(data);
		}
	} catch (e) {
		console.log(e);
		result = false;
	}

	return {
		body: JSON.stringify({ result }),
		headers
	};
};

async function hashedCode(code: string, saltRounds = 10) {
	console.log('hashing');
	return bcrypt.hash(code, saltRounds);
}
