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
            table.string('company_name').notNullable();
            table.integer('user_id').notNullable();
            table.foreign('user_id').references('user_id').inTable('users');
            table.timestamp('created_at').notNullable();
        });

        await connection.schema.dropTableIfExists('projects');
        await connection.schema.createTable('projects', table => {
            table.increments('project_id');
            table.string('project_name').notNullable();
            table.integer('rate').notNullable();
            table.enu('rate_type', ['hourly', 'fixed']).notNullable();
            table.enu('status', ['active', 'inactive']).notNullable();
            table.integer('client_id').notNullable();
            table.foreign('client_id').references('client_id').inTable('clients');
            table.timestamp('created_at').notNullable();
        });

        await connection.schema.dropTableIfExists('sessions');
        await connection.schema.createTable('sessions', table => {
            table.increments('session_id');
            table.timestamp('started_at').notNullable();
            table.timestamp('ended_at');
            table.integer('duration');
            table.integer('project_id').notNullable();
            table.foreign('project_id').references('project_id').inTable('projects');
            table.timestamp('created_at').notNullable();
        });

    } catch (error) {
        console.log(error);
    } 
};



