describe('Requests API', () => {
  let requestId: string;

  before(() => {
    // Create a person to generate a request
    const testPerson = {
      name: 'Request Test Person',
      dateOfBirth: '1990-01-01',
      score: 85,
      salary: 50000.5,
      active: true,
      comment: 'Test comment for requests',
    };

    cy.request({
      method: 'POST',
      url: '/persons',
      body: testPerson,
    }).then((response) => {
      requestId = response.body.requestId;
    });
  });

  describe('GET /requests/:id', () => {
    it('should get request status by ID', () => {
      // Wait for the CRON job to process the request
      cy.wait(3000);

      cy.request('GET', `/requests/${requestId}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('status');
        expect(response.body.status).to.be.oneOf([
          'OPEN',
          'IN_PROGRESS',
          'COMPLETED',
          'ERROR',
        ]);
      });
    });

    it('should return 404 for non-existent request', () => {
      cy.request({
        method: 'GET',
        url: '/requests/non-existent-id',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  });

  describe('GET /requests', () => {
    it('should get all requests', () => {
      cy.request('GET', '/requests').then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');

        // Verify the response structure
        const request = response.body[0];
        expect(request).to.have.all.keys([
          'requestId',
          'changedAt',
          'status',
          'command',
          'payload',
        ]);

        // Verify sorting (changedAt DESC)
        const dates = response.body.map((r) => new Date(r.changedAt).getTime());
        const isSortedDesc = dates.every(
          (d, i) => i === 0 || d <= dates[i - 1],
        );
        expect(isSortedDesc).to.be.true;
      });
    });
  });
});
