export const setupDb = async (connection) => {
    // Create tables and seed initial data
    try {
        // TODO: Use migrations
        // TODO: Persist changes instead of wiping the tables here
        await connection.schema.dropTableIfExists('users');
        await connection.schema.createTable('users', table => {
            table.increments('user_id');
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.enu('user_role', ['admin', 'user']).notNullable();
            table.timestamp('created_at').notNullable();
        });

        await connection.schema.dropTableIfExists('clients');
        await connection.schema.createTable('clients', table => {
            table.increments('client_id');
            table.integer('user_id').notNullable();
            table.string('company_name').notNullable();
            table.foreign('user_id').references('user_id').inTable('users');
            table.timestamp('created_at').notNullable();
        });

    } catch (error) {
        console.log(error);
    } 
};



