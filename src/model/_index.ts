import pkg from 'sequelize';
const { Sequelize, DataTypes, Model } = pkg;


export const sequelize = new Sequelize({
	dialect: 'mysql',
	port: 3306,
	database: 'u164256670_mychurch',
	password: 'S9#uZ1ap',
	username: 'u164256670_mychurch'
	// database: 'mychurch',
	// password: 'root',
	// username: 'root'
});

export class Church extends Model {}

Church.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true
		},
		name: DataTypes.STRING,
		location: DataTypes.STRING,
		color: DataTypes.STRING,
		adminCode: DataTypes.STRING,
		participantCode: DataTypes.STRING,
		noParticipants: DataTypes.INTEGER,
	},
	{ sequelize, modelName: 'churches' }
);

sequelize.sync();

(async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
})();
