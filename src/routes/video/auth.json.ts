import { Church } from '../../model/_index';
import sequelize from 'sequelize';

const { Op } = sequelize;

import bcrypt from 'bcryptjs';

const headers = {
	'Content-Type': 'application/json'
};

export const post: RequestHandler = async ({ body }) => {
	if (typeof body == 'string') {
		let authentication = false;
		const params = new URLSearchParams(body);
		console.log('The request params are', body);

		const roomId = params.get('roomId');
		const password = params.get('password');
        const host = params.get('host');


		const { adminCode, participantCode } = await Church.findOne({
			attributes: ['adminCode', 'participantCode'],
			where: {
				id: {
					[Op.eq]: roomId
				}
			}
		});

        console.log(password, participantCode)

		if (await bcrypt.compare(password, host ? adminCode : participantCode)) authentication = true;

		return {
			body: JSON.stringify({ authentication, host }),
			headers
		};
	}
};
