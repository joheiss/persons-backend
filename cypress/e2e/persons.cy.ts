describe('Persons API', () => {
  const testPerson = {
    name: 'Test Person',
    dateOfBirth: '1990-01-01',
    score: 85,
    salary: 50000.5,
    active: false,
    comment: 'Test comment',
  };

  let personId: string;
  let requestId: string;

  describe('POST /persons', () => {
    it('should create a new person request', () => {
      cy.request({
        method: 'POST',
        url: '/persons',
        body: testPerson,
      }).then((response) => {
        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('requestId');
        requestId = response.body.requestId;
        cy.log('Request ID: ' + requestId);
        // Wait for the CRON job to process the request (runs every 2 seconds)
        cy.wait(3000);
      });
    });
  });

  describe('GET /persons', () => {
    it('should get all persons', () => {
      cy.request('GET', '/persons').then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        const createdPerson = response.body.find(
          (p) => p.name === testPerson.name,
        );
        expect(createdPerson).to.exist;
        personId = createdPerson.uuid;
      });
    });

    it('should get a person by ID', () => {
      cy.request('GET', `/persons/${personId}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.name).to.equal(testPerson.name);
        expect(response.body.dateOfBirth).to.equal(testPerson.dateOfBirth);
        expect(response.body.score).to.equal(testPerson.score);
        expect(+response.body.salary).to.equal(testPerson.salary);
        expect(response.body.active).to.equal(testPerson.active);
        expect(response.body.comment).to.equal(testPerson.comment);
        // expect(response.body).to.deep.include(testPerson);
      });
    });

    it('should return 404 for non-existent person', () => {
      cy.request({
        method: 'GET',
        url: '/persons/non-existent-id',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  });

  describe('PUT /persons/:id', () => {
    const updateData = {
      name: 'Updated Test Person',
      salary: 60000.75,
    };

    it('should update an existing person', () => {
      cy.request({
        method: 'PUT',
        url: `/persons/${personId}`,
        body: updateData,
      }).then((response) => {
        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('requestId');

        // Wait for the CRON job to process the request
        cy.wait(3000);

        // Verify the update
        cy.request('GET', `/persons/${personId}`).then((getResponse) => {
          expect(getResponse.body.name).to.equal(updateData.name);
          expect(+getResponse.body.salary).to.equal(updateData.salary);
        });
      });
    });
  });

  describe('DELETE /persons/:id', () => {
    it('should delete an existing person', () => {
      cy.request({
        method: 'DELETE',
        url: `/persons/${personId}`,
      }).then((response) => {
        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('requestId');

        // Wait for the CRON job to process the request
        cy.wait(3000);

        // Verify the deletion
        cy.request({
          method: 'GET',
          url: `/persons/${personId}`,
          failOnStatusCode: false,
        }).then((getResponse) => {
          expect(getResponse.status).to.equal(404);
        });
      });
    });
  });
});
