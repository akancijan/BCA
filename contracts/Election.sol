pragma solidity ^0.5.0 ;

contract Election {
  // Model kandidata
  struct Kandidat{
  	uint id;
  	string ime;
  	uint brojGlasova;
  }
  //Spremanje kandidata po id-u
  mapping(uint => Kandidat) public kandidati;

  mapping(address => bool) public glasaci;
  //Spremanje broja kandidata
  uint public brojKandidata;

 // voted event
    event votedEvent (
        uint indexed _candidateId
    );

  constructor() public {
        dodajKandidata("Donald Trump");
        dodajKandidata("Dwayne 'The Rock' Johnson");
    }

  function dodajKandidata (string memory _ime) private {
        brojKandidata ++; // povecanje broja kandidata
        kandidati[brojKandidata] = Kandidat(brojKandidata, _ime, 0); // dodajemo kandidata na listu i stavljamo mu broj glasova na 0
    }

  function glasaj (uint _kandidatId) public {
  		//kako bi adresa mogla glasati ne smije biti vec na popisu glasaca
  		require(!glasaci[msg.sender]);

  		// mora postojati kandidat za kojeg se glasa
  		require(_kandidatId > 0 && _kandidatId <= brojKandidata);

  		// zapis adrese koja je glasala
  		glasaci[msg.sender] = true;

  		// promjena broja glasova kandidata
  		kandidati[_kandidatId].brojGlasova++;

  		// pokretanje voted event-a za praćenje
  		emit votedEvent(_kandidatId);
  }
}