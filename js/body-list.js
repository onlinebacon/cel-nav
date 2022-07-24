const rawList = `
    Sun
    Moon

    Mercury
    Venus
    Mars
    Jupiter
    Saturn
    
    Acamar
    Achernar
    Acrux
    Adhara
    Al Na'ir
    Aldebaran
    Alioth
    Alkaid
    Alnilam
    Alphard
    Alphecca
    Alpheratz
    Altair
    Ankaa
    Antares
    Arcturus
    Atria
    Avior
    Bellatrix
    Betelgeuse
    Canopus
    Capella
    Deneb
    Denebola
    Diphda
    Dubhe
    Elnath
    Eltanin
    Enif
    Fomalhaut
    Gacrux
    Gienah
    Hadar
    Hamal
    Kaus Australis
    Kochab
    Markab
    Menkar
    Menkent
    Miaplacidus
    Mirfak
    Nunki
    Peacock
    Polaris
    Pollux
    Procyon
    Rasalhague
    Regulus
    Rigel
    Rigil Kentaurus
    Sabik
    Scheat
    Schedar
    Shaula
    Sirius
    Spica
    Suhail
    Vega
    Zuben'ubi
`;

const list = rawList
    .trim()
    .split(/\s*\n\s*/)
    .map(name => ({ name }));

export default list;
