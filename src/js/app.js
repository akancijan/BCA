App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // Ako je web3 instanca dana od Meta Maska.
      App.web3Provider = web3.currentProvider;
      ethereum.enable();
      web3 = new Web3(web3.currentProvider);
    } else {
      // Odredi defaultnu instancu ako nema web3 instance
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      ethereum.enable();
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Praćenje evenata s ugovora
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Novi render nakon sta se da glas kako bi se stranica osvjezila
        App.render();
      });
    });
  },
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Dohvacanje informacija racuna
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Dohvacanje informacija ugovora
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.brojKandidata();
    }).then(function(brojKandidata) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= brojKandidata; i++) {
        electionInstance.kandidati(i).then(function(kandidat) {
          var id = kandidat[0];
          var ime = kandidat[1];
          var brojGlasova = kandidat[2];

          // Prikaz trenutnih kandidata
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + ime + "</td><td>" + brojGlasova + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          // Prikaz opcija za glasanje
          var candidateOption = "<option value='" + id + "' >" + ime + "</ option>"
          candidatesSelect.append(candidateOption);

        });
      }
return electionInstance.glasaci(App.account);
    }).then(function(hasVoted) {
      // Sakrivanje izbora za glasanje ako je korisnik vec glasao
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.glasaj(candidateId, { from: App.account });
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});