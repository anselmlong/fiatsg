// Reading references from SOURCES.md. Keep image credits on the portrait.
export type SaintSource = { label: string; url: string };

export const SAINT_SOURCES: Record<string, SaintSource[]> = {
  "monica": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-monica/"
    }
  ],
  "joseph": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-joseph-husband-of-mary/"
    }
  ],
  "andrew": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-andrew/"
    }
  ],
  "philip": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saints-philip-and-james/"
    }
  ],
  "john-vianney": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-john-vianney/"
    },
    {
      "label": "Catechism 2658",
      "url": "https://www.vatican.va/archive/ENG0015/__P9D.HTM"
    }
  ],
  "frassati": [
    {
      "label": "Hallow: St Pier Giorgio Frassati",
      "url": "https://hallow.com/saints/pier-giorgio-frassati/"
    },
    {
      "label": "Frassati USA, \"Verso l'alto\"",
      "url": "https://frassatiusa-org.sites.ecatholic.com/verso-lalto"
    }
  ],
  "ignatius": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-ignatius-of-loyola/"
    }
  ],
  "cabrini": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-frances-xavier-cabrini/"
    }
  ],
  "lorenzo-ruiz": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-lorenzo-ruiz-and-companions/"
    },
    {
      "label": "Vatican News",
      "url": "https://www.vaticannews.va/en/saints/09/28/sts---lorenzo-ruiz-and--companions--martyrs.html"
    },
    {
      "label": "John Paul II, 1981",
      "url": "https://www.vatican.va/content/john-paul-ii/en/homilies/1981/documents/hf_jp-ii_hom_19810218_beatificazione-ruiz.html"
    }
  ],
  "bakhita": [
    {
      "label": "Holy See biography",
      "url": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20001001_giuseppina-bakhita_en.html"
    },
    {
      "label": "Benedict XVI, *Spe Salvi* 3",
      "url": "https://www.vatican.va/content/benedict-xvi/en/encyclicals/documents/hf_ben-xvi_enc_20071130_spe-salvi.html"
    }
  ],
  "scalabrini": [
    {
      "label": "Scalabrinian Missionaries",
      "url": "https://win.scalabriniane.org/eng/scalabrini.html"
    },
    {
      "label": "novena to St Scalabrini",
      "url": "https://www.scalabrinisaintcharles.org/docs/novena-to-st-scalabrini-en-light-blue.pdf"
    }
  ],
  "peter-claver": [
    {
      "label": "Franciscan Media",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-peter-claver/"
    }
  ],
  "toribio-romo": [
    {
      "label": "Catholic.net: Toribio Romo González",
      "url": "https://www.es.catholic.net/op/articulos/53246/toribio-romo-gonzlez-santo.html"
    },
    {
      "label": "Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Toribio_Romo"
    }
  ],
  "joachim-anne": [
    {
      "label": "Sts Joachim & Anne — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saints-joachim-and-anne/"
    },
    {
      "label": "Sirach 3:12 (NRSVUE)",
      "url": "https://www.biblegateway.com/passage/?search=Sirach+3%3A12&version=NRSVUE"
    }
  ],
  "jeanne-jugan": [
    {
      "label": "St Jeanne Jugan — biography",
      "url": "https://www.vatican.va/news_services/liturgy/saints/2009/ns_lit_doc_20091011_jugan_en.html"
    },
    {
      "label": "St Jeanne Jugan, quoted in the Holy See biography",
      "url": "https://www.vatican.va/news_services/liturgy/saints/2009/ns_lit_doc_20091011_jugan_en.html"
    }
  ],
  "teresa-jornet": [
    {
      "label": "St Teresa of Jesus Jornet — biography",
      "url": "https://www.bisbatlleida.org/es/content/santa-teresa-jornet"
    },
    {
      "label": "Psalm 71:9 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=Psalm+71%3A9&version=WEB"
    }
  ],
  "nicholas": [
    {
      "label": "St Nicholas — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-nicholas/"
    },
    {
      "label": "Mark 9:37 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=Mark+9%3A37&version=WEB"
    }
  ],
  "john-bosco": [
    {
      "label": "St John Bosco — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-john-bosco/"
    },
    {
      "label": "Mark 10:14 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=Mark+10%3A14&version=WEB"
    }
  ],
  "john-baptist-de-la-salle": [
    {
      "label": "St John Baptist de La Salle — biography",
      "url": "https://www.lasalle.org/en/lasallian-holiness/founder/"
    },
    {
      "label": "Matthew 19:14 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=Matthew+19%3A14&version=WEB"
    }
  ],
  "martin-de-porres": [
    {
      "label": "St Martin de Porres — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-martin-de-porres/"
    },
    {
      "label": "Galatians 6:2 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=Galatians+6%3A2&version=WEB"
    }
  ],
  "camillus-de-lellis": [
    {
      "label": "St Camillus de Lellis — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-camillus-de-lellis/"
    },
    {
      "label": "Luke 10:37 (World English Bible), Jesus after the parable of the Good Samaritan",
      "url": "https://www.biblegateway.com/passage/?search=Luke+10%3A37&version=WEB"
    }
  ],
  "damien-of-molokai": [
    {
      "label": "St Damien of Molokai — biography",
      "url": "https://www.vatican.va/news_services/liturgy/saints/2009/ns_lit_doc_20091011_de-veuster_en.html"
    },
    {
      "label": "John 15:13 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=John+15%3A13&version=WEB"
    }
  ],
  "elizabeth-of-hungary": [
    {
      "label": "St Elizabeth of Hungary — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-elizabeth-of-hungary/"
    },
    {
      "label": "Proverbs 19:17 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=Proverbs+19%3A17&version=WEB"
    }
  ],
  "vincent-de-paul": [
    {
      "label": "St Vincent de Paul — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-vincent-de-paul/"
    },
    {
      "label": "1 John 3:18 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=1+John+3%3A18&version=WEB"
    }
  ],
  "teresa-of-calcutta": [
    {
      "label": "St Teresa of Calcutta — biography",
      "url": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20031019_madre-teresa_en.html"
    },
    {
      "label": "John 19:28 (World English Bible), the words of Jesus at the heart of Mother Teresa's calling",
      "url": "https://www.biblegateway.com/passage/?search=John+19%3A28&version=WEB"
    }
  ],
  "thomas-aquinas": [
    {
      "label": "St Thomas Aquinas — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-thomas-aquinas/"
    },
    {
      "label": "James 1:5 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=James+1%3A5&version=WEB"
    }
  ],
  "benedict": [
    {
      "label": "St Benedict — biography",
      "url": "https://www.franciscanmedia.org/saint-of-the-day/saint-benedict/"
    },
    {
      "label": "Mark 6:31 (World English Bible)",
      "url": "https://www.biblegateway.com/passage/?search=Mark+6%3A31&version=WEB"
    }
  ]
};
