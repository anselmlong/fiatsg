import type { Saint } from "./saints";
import type { SaintSource } from "./saint-sources";

export type Discovery = "lost-key" | "sources" | "bird" | "cheat-code";

// Separate from the service roster: discoveries never change cause pools or completion.
export const BONUS_SAINTS: (Saint & { discovery: Discovery; hint: string; sources: SaintSource[] })[] = [
  {
    id: "bonus-anthony", discovery: "lost-key", name: "St Anthony of Padua",
    feast: "13 June", patron: "Patron of lost things", category: "faith", tier: 1,
    hint: "Something small has been misplaced on the home page.",
    story: "Anthony grew up in Lisbon and became a Franciscan friar. A gifted preacher and teacher, he helped people understand Scripture and spent his last years in Padua. Catholics often ask his prayers when something is lost. Finding a little key here is a playful reminder of that devotion, and an invitation to notice what others overlook.",
    quote: { text: "", source: "" },
    prayer: "St Anthony, help us seek what matters and notice those who feel forgotten.",
    why: "You found the lost key. Some good things begin with paying attention.",
    image: "/saints/bonus-anthony.jpg",
    credit: "Francisco de Zurbarán, Saint Anthony of Padua. Public domain, via Wikimedia Commons.",
    sources: [{ label: "Franciscan Media — St Anthony of Padua", url: "https://www.franciscanmedia.org/saint-of-the-day/saint-anthony-of-padua/" }],
  },
  {
    id: "bonus-thomas", discovery: "sources", name: "St Thomas the Apostle",
    feast: "3 July", patron: "One of the Twelve Apostles", category: "faith", tier: 1,
    hint: "Every saint has a story. Look a little closer at where it comes from.",
    story: "Thomas asked honest questions. When the other disciples told him they had seen the risen Jesus, he wanted to see for himself. Jesus came to him, and Thomas answered with a profession of faith: “My Lord and my God!” His story in John 20 leaves room for questions on the way to belief. This card celebrates taking time to read, check and understand.",
    quote: { text: "My Lord and my God!", source: "John 20:28" },
    prayer: "St Thomas, accompany us in our questions and help us grow in faith.",
    why: "You opened the sources behind a saint's story. Curiosity can be a beginning.",
    image: "/saints/bonus-thomas.jpg",
    credit: "El Greco, Apostle St Thomas, 1610–1614. Public domain, via Wikimedia Commons.",
    sources: [{ label: "Benedict XVI — Thomas, the twin", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20060927.html" }],
  },
  {
    id: "bonus-francis", discovery: "bird", name: "St Francis of Assisi",
    feast: "4 October", patron: "Patron of animals and ecology", category: "faith", tier: 1,
    hint: "A little visitor rests at the foot of the page.",
    story: "Francis left a comfortable life in Assisi to follow Jesus in poverty and simplicity. He cared for people who were pushed aside, and companions joined his way of life. His love for creation still inspires Christians to care for the world around them. The little bird on Fiat is a reminder to pause and notice a fellow creature.",
    quote: { text: "", source: "" },
    prayer: "St Francis, teach us gentleness toward our neighbours and all God's creation.",
    why: "You noticed the little bird. There is room for wonder, even at the foot of a page.",
    image: "/saints/bonus-francis.jpg",
    credit: "Unknown artist, Saint Francis of Assisi, 1615–1635. Public domain, via Wikimedia Commons / Google Art Project.",
    sources: [{ label: "Franciscan Media — St Francis of Assisi", url: "https://www.franciscanmedia.org/saint-of-the-day/saint-francis-of-assisi/" }, { label: "Vatican News — The feast of St Francis", url: "https://www.vaticannews.va/en/church/news/2022-10/st-francis-mass-assisi-zuppi-mattarella-ecology-peace.html" }],
  },
  {
    id: "bonus-isidore", discovery: "cheat-code", name: "St Isidore of Seville",
    feast: "4 April", patron: "Patron of the internet", category: "faith", tier: 1,
    hint: "Some codes never go out of style. Type it anywhere on Fiat: ↑↑↓↓←→←→BA",
    story: "Isidore was bishop of Seville around the year 600. He gathered what the ancient world knew into the Etymologies, an encyclopedia that teachers copied and studied for centuries. Because he tried to put all knowledge within reach, he is often proposed as patron of the internet and of people who work with computers. Typing an old cheat code to find him is a small reminder that what we learn is meant to serve God and our neighbour.",
    quote: { text: "", source: "" },
    prayer: "St Isidore, help us use what we know, online and off, for the good of others.",
    why: "You entered the secret code. Even play can lead somewhere good.",
    image: "/saints/bonus-isidore.jpg",
    credit: "Bartolomé Esteban Murillo, San Isidoro, 1655. Public domain, via Wikimedia Commons.",
    sources: [{ label: "Franciscan Media — St Isidore of Seville", url: "https://www.franciscanmedia.org/saint-of-the-day/saint-isidore-of-seville/" }],
  },
];

export const bonusForDiscovery = (discovery: string) => BONUS_SAINTS.find((s) => s.discovery === discovery);
