
exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments()
    table.integer('user_id').notNullable()
    table.foreign('user_id').references('id').inTable('users').onDelete('cascade')
    table.integer('book_id').notNullable()
    table.foreign('book_id').references('id').inTable('books').onDelete('cascade')
    table.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'))
    table.dateTime('updated_at').notNullable().defaultTo(knex.raw('now()'))
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('favorites')
};
