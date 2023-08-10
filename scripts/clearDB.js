db = connect( 'mongodb://localhost/ath-api-tb-test' );

collections = db.getCollectionNames();

collections.forEach(collection => {
    db[collection].deleteMany({});
});
