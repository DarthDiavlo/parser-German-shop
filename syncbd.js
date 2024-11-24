const { sequelize } = require('./connectionBD.js')

function syncbd(){
	sequelize.sync()
	  .then(() => {
	    console.log('База данных успешно синхронизирована.');
	  })
	  .catch((error) => {
	    console.error('Ошибка синхронизации базы данных:', error);
	  });
}

module.exports = { syncbd };