var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
	var electionInstance;

	it("inicijalizacija s 2 kandidata", function() {
	    return Election.deployed().then(function(instance) {
	      return instance.brojKandidata();
	    }).then(function(count) {
	      assert.equal(count, 2);
	    });
	  });
	it("inicijalizacija kandidata s pravim vrijednostima", function() {
	    return Election.deployed().then(function(instance) {
	      electionInstance = instance;
	      return electionInstance.kandidati(1);
	    }).then(function(candidate) {
	      assert.equal(candidate[0], 1, "pravi id");
	      assert.equal(candidate[1], "Donald Trump", "pravo ime");
	      assert.equal(candidate[2], 0, "točan broj glasova");
	      return electionInstance.kandidati(2);
	    }).then(function(candidate) {
	      assert.equal(candidate[0], 2, "pravi id");
	      assert.equal(candidate[1], "Dwayne 'The Rock' Johnson", "pravo ime");
	      assert.equal(candidate[2], 0, "točan broj glasova");
	    });
	  });

	it("glasaču se dopušta glasanje", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.glasaj(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "event je pokrenut");
      assert.equal(receipt.logs[0].event, "votedEvent", "event je pravog tipa");
      assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "ID kandidata je ispravan");
      return electionInstance.glasaci(accounts[0]);
    }).then(function(voted) {
      assert(voted, "glasac je oznacen da je glasao");
      return electionInstance.kandidati(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "povecava se broj glasova kandidata");
    	})
  	});

  	it("iznimka za nevaljanog kandidata", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.glasaj(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.kandidati(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "kandidat 1 nije dobio glasove");
      return electionInstance.kandidati(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "kandidat 2 nije dobio glasove");
    });
  });

  	it("iznimka za dvostruko glasanje s adrese", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      electionInstance.glasaj(candidateId, { from: accounts[1] });
      return electionInstance.kandidati(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "prihvati prvi glas");
      // Pokusaj ponovnog glasanja
      return electionInstance.glasaj(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.kandidati(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "kandidat 1 nije dobio glasove");
      return electionInstance.kandidati(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "kandidat 2 nije dobio glasove");
    });
  });



	 });
