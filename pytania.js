// Talia wbudowana — każdy członek drużyny dostaje ją po otwarciu appki.
// Format: { k: kategoria, p: pytanie, o: odpowiedź, h: [4 warianty podpowiedzi] (opcjonalnie), z: link do źródła (opcjonalnie) }
// Pytania własne, w stylu programu. Swoje dopisuj na końcu albo importuj z poziomu appki.
window.PYTANIA = [
  // Historia
  { k: "Historia", p: "W którym roku odbyła się bitwa pod Grunwaldem?", o: "1410", h: ["1386", "1410", "1466", "1525"] },
  { k: "Historia", p: "Jak nazywał się ostatni król Polski?", o: "Stanisław August Poniatowski" },
  { k: "Historia", p: "Który władca Polski przyjął chrzest w 966 roku?", o: "Mieszko I" },
  { k: "Historia", p: "W którym roku upadł mur berliński?", o: "1989", h: ["1981", "1989", "1990", "1991"] },
  { k: "Historia", p: "Które miasto uważa się tradycyjnie za pierwszą stolicę Polski?", o: "Gniezno", h: ["Kraków", "Poznań", "Gniezno", "Płock"] },

  // Geografia
  { k: "Geografia", p: "Jaka jest najdłuższa rzeka Polski?", o: "Wisła" },
  { k: "Geografia", p: "Jak nazywa się najwyższy szczyt Polski?", o: "Rysy (2499 m n.p.m.)" },
  { k: "Geografia", p: "Jakie miasto jest stolicą Australii?", o: "Canberra", h: ["Sydney", "Melbourne", "Canberra", "Perth"] },
  { k: "Geografia", p: "Ile województw ma Polska?", o: "16" },
  { k: "Geografia", p: "Na którym kontynencie leży pustynia Atakama?", o: "Ameryka Południowa" },
  { k: "Geografia", p: "Jak nazywa się najgłębsze jezioro w Polsce?", o: "Hańcza", h: ["Śniardwy", "Hańcza", "Drawsko", "Mamry"] },

  // Nauka
  { k: "Nauka", p: "Jaki symbol chemiczny ma złoto?", o: "Au", h: ["Ag", "Au", "Zl", "Go"] },
  { k: "Nauka", p: "Z ilu kości składa się szkielet dorosłego człowieka?", o: "206", h: ["186", "206", "226", "300"] },
  { k: "Nauka", p: "Które dwa pierwiastki odkryła Maria Skłodowska-Curie (wspólnie z Piotrem Curie)?", o: "Polon i rad" },
  { k: "Nauka", p: "Który pierwiastek ma symbol Fe?", o: "Żelazo" },
  { k: "Nauka", p: "Ile w przybliżeniu wynosi prędkość światła w próżni?", o: "Ok. 300 000 km/s" },

  // Przyroda
  { k: "Przyroda", p: "Jaki jest największy ssak żyjący na Ziemi?", o: "Płetwal błękitny" },
  { k: "Przyroda", p: "Ile odnóży krocznych ma pająk?", o: "8" },
  { k: "Przyroda", p: "Jak nazywa się młode sarny?", o: "Koźlę", h: ["Cielę", "Koźlę", "Jagnię", "Prosię"] },

  // Literatura
  { k: "Literatura", p: "Kto napisał „Pana Tadeusza”?", o: "Adam Mickiewicz" },
  { k: "Literatura", p: "Kto jest autorem powieści „Lalka”?", o: "Bolesław Prus" },
  { k: "Literatura", p: "Jak nazywa się główny bohater „Zbrodni i kary” Dostojewskiego?", o: "Rodion Raskolnikow" },
  { k: "Literatura", p: "Który polski pisarz otrzymał literackiego Nobla w 1905 roku?", o: "Henryk Sienkiewicz", h: ["Bolesław Prus", "Henryk Sienkiewicz", "Władysław Reymont", "Stefan Żeromski"] },

  // Muzyka
  { k: "Muzyka", p: "Ile symfonii skomponował Ludwig van Beethoven?", o: "9", h: ["5", "7", "9", "12"] },
  { k: "Muzyka", p: "Z jakiego miasta pochodził zespół The Beatles?", o: "Liverpool" },
  { k: "Muzyka", p: "W jakiej miejscowości urodził się Fryderyk Chopin?", o: "Żelazowa Wola" },

  // Film
  { k: "Film", p: "Kto wyreżyserował film „Szczęki” z 1975 roku?", o: "Steven Spielberg" },
  { k: "Film", p: "Który aktor zagrał Kargula w filmie „Sami swoi”?", o: "Władysław Hańcza", h: ["Wacław Kowalski", "Władysław Hańcza", "Zdzisław Maklakiewicz", "Jan Himilsbach"] },
  { k: "Film", p: "Który polski film zdobył Oscara dla najlepszego filmu nieanglojęzycznego w 2015 roku?", o: "„Ida” (reż. Paweł Pawlikowski)" },

  // Sport
  { k: "Sport", p: "Ilu zawodników jednej drużyny przebywa na boisku w siatkówce halowej?", o: "6" },
  { k: "Sport", p: "W którym mieście odbyły się Letnie Igrzyska Olimpijskie w 2024 roku?", o: "Paryż" },
  { k: "Sport", p: "W jakim klubie grał Robert Lewandowski bezpośrednio przed przejściem do Bayernu Monachium?", o: "Borussia Dortmund", h: ["Lech Poznań", "Borussia Dortmund", "Schalke 04", "Hamburger SV"] },

  // Sztuka
  { k: "Sztuka", p: "Kto namalował „Bitwę pod Grunwaldem”?", o: "Jan Matejko" },
  { k: "Sztuka", p: "W którym muzeum wisi „Mona Lisa”?", o: "Luwr (Paryż)" },
  { k: "Sztuka", p: "Kto jest autorem obrazu „Dama z gronostajem”?", o: "Leonardo da Vinci", h: ["Rafael", "Leonardo da Vinci", "Michał Anioł", "Tycjan"] },

  // Mitologia
  { k: "Mitologia", p: "Kto w mitologii greckiej był bogiem morza?", o: "Posejdon" },
  { k: "Mitologia", p: "Jak nazywał się rzymski odpowiednik Zeusa?", o: "Jowisz" },

  // Kuchnia
  { k: "Kuchnia", p: "Z jakiego kraju pochodzi paella?", o: "Hiszpania" },
  { k: "Kuchnia", p: "Jaki owoc jest podstawą guacamole?", o: "Awokado" },

  // Język polski
  { k: "Język polski", p: "Ile liter liczy polski alfabet?", o: "32", h: ["26", "29", "32", "35"] },

  // Technologia
  { k: "Technologia", p: "Jak rozwija się skrót WWW?", o: "World Wide Web" },
  { k: "Technologia", p: "Kto razem z Paulem Allenem założył Microsoft?", o: "Bill Gates" },

  // Astronomia
  { k: "Astronomia", p: "Którą planetę nazywa się Czerwoną Planetą?", o: "Mars" },
  { k: "Astronomia", p: "Ile planet liczy Układ Słoneczny?", o: "8" },
  { k: "Astronomia", p: "Która planeta jest najmniejsza w Układzie Słonecznym?", o: "Merkury", h: ["Mars", "Merkury", "Wenus", "Pluton"] },
];
