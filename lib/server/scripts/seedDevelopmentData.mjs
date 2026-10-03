import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config({ path: ".env.development" });
dotenv.config({ path: ".env.development.local", override: true });

if (process.env.NODE_ENV !== "development") {
  throw new Error("Development seed data can only run with NODE_ENV=development.");
}

const connection = process.env.DB_CONNECTION || "mongodb://localhost:27017";
const databaseName = process.env.MONGO_DB || "idiomatically";
const hostname = new URL(connection).hostname;
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "mongo"]);
if (!localHosts.has(hostname)) {
  throw new Error(
    `Refusing to seed a non-local MongoDB host: ${hostname}`,
  );
}

const groups = [
  {
    key: "two-birds",
    meaning:
      "To accomplish two goals with a single action, saving time or effort.",
    idioms: [
      entry("en", "US", "Kill two birds with one stone"),
      entry(
        "es",
        "ES",
        "Matar dos pájaros de un tiro",
        "Kill two birds with one shot",
      ),
      entry(
        "fr",
        "FR",
        "Faire d’une pierre deux coups",
        "Make two hits with one stone",
      ),
      entry(
        "de",
        "DE",
        "Zwei Fliegen mit einer Klappe schlagen",
        "Hit two flies with one swatter",
      ),
      entry(
        "it",
        "IT",
        "Prendere due piccioni con una fava",
        "Catch two pigeons with one fava bean",
      ),
      entry(
        "pt",
        "BR",
        "Matar dois coelhos com uma cajadada só",
        "Kill two rabbits with one blow of a stick",
      ),
      entry(
        "ja",
        "JP",
        "一石二鳥",
        "One stone, two birds",
        "Isseki nichō",
      ),
      entry(
        "zh",
        "CN",
        "一石二鸟",
        "One stone, two birds",
        "Yī shí èr niǎo",
      ),
    ],
  },
  {
    key: "easy",
    meaning:
      "Something that is very easy to do and requires little effort.",
    idioms: [
      entry("en", "US", "Piece of cake"),
      entry("es", "ES", "Pan comido", "Eaten bread"),
      entry("fr", "FR", "C’est du gâteau", "It is cake"),
      entry("de", "DE", "Ein Kinderspiel", "A children’s game"),
      entry("it", "IT", "Un gioco da ragazzi", "A children’s game"),
      entry("pt", "BR", "É mamão com açúcar", "It is papaya with sugar"),
      entry(
        "ja",
        "JP",
        "朝飯前",
        "Before breakfast",
        "Asameshi mae",
      ),
    ],
  },
  {
    key: "speak-of-the-devil",
    meaning:
      "Said when someone appears just after they have been mentioned.",
    idioms: [
      entry("en", "US", "Speak of the devil"),
      entry(
        "es",
        "ES",
        "Hablando del rey de Roma",
        "Speaking of the king of Rome",
      ),
      entry(
        "fr",
        "FR",
        "Quand on parle du loup",
        "When one speaks of the wolf",
      ),
      entry(
        "de",
        "DE",
        "Wenn man vom Teufel spricht",
        "When one speaks of the devil",
      ),
      entry(
        "it",
        "IT",
        "Parli del diavolo e spuntano le corna",
        "Speak of the devil and the horns appear",
      ),
      entry("pt", "BR", "Falando no diabo", "Speaking of the devil"),
      entry(
        "ja",
        "JP",
        "噂をすれば影",
        "Speak of a rumor and its shadow appears",
        "Uwasa o sureba kage",
      ),
    ],
  },
  {
    key: "expensive",
    meaning:
      "Something that costs an unexpectedly or unreasonably large amount.",
    idioms: [
      entry("en", "US", "Cost an arm and a leg"),
      entry(
        "es",
        "ES",
        "Costar un ojo de la cara",
        "Cost an eye from the face",
      ),
      entry(
        "fr",
        "FR",
        "Coûter les yeux de la tête",
        "Cost the eyes from the head",
      ),
      entry("de", "DE", "Ein Vermögen kosten", "Cost a fortune"),
      entry(
        "it",
        "IT",
        "Costare un occhio della testa",
        "Cost an eye from the head",
      ),
      entry(
        "pt",
        "BR",
        "Custar os olhos da cara",
        "Cost the eyes from the face",
      ),
      entry(
        "ja",
        "JP",
        "目の玉が飛び出るほど高い",
        "So expensive that your eyeballs pop out",
        "Me no tama ga tobideru hodo takai",
      ),
    ],
  },
  {
    key: "never",
    meaning:
      "A humorous way to say that something will never happen.",
    idioms: [
      entry("en", "US", "When pigs fly"),
      entry(
        "es",
        "ES",
        "Cuando las ranas críen pelo",
        "When frogs grow hair",
      ),
      entry(
        "fr",
        "FR",
        "Quand les poules auront des dents",
        "When hens have teeth",
      ),
      entry(
        "it",
        "IT",
        "Quando gli asini voleranno",
        "When donkeys fly",
      ),
      entry(
        "pt",
        "BR",
        "Quando os porcos voarem",
        "When pigs fly",
      ),
      entry(
        "ru",
        "RU",
        "Когда рак на горе свистнет",
        "When the crayfish whistles on the mountain",
        "Kogda rak na gore svistnet",
      ),
      entry(
        "el",
        "GR",
        "Όταν πετάξουν τα γουρούνια",
        "When pigs fly",
        "Otan petaxoun ta gourounia",
      ),
    ],
  },
];

const seedName = "multilingual-demo";
const collectionName = "idiom";
const client = new MongoClient(connection);

try {
  await client.connect();
  const collection = client.db(databaseName).collection(collectionName);
  const entries = groups.flatMap((group) =>
    group.idioms.map((idiom) => ({
      ...idiom,
      groupKey: group.key,
      meaning: group.meaning,
      seedKey: `${group.key}:${idiom.languageKey}`,
    })),
  );
  const seedKeys = entries.map((item) => item.seedKey);
  const existing = await collection
    .find({
      localSeed: seedName,
      localSeedKey: { $in: seedKeys },
    })
    .project({ _id: 1, localSeedKey: 1, createdAt: 1 })
    .toArray();
  const existingByKey = new Map(
    existing.map((item) => [item.localSeedKey, item]),
  );
  const idsByKey = new Map(
    entries.map((item) => [
      item.seedKey,
      existingByKey.get(item.seedKey)?._id || new ObjectId(),
    ]),
  );
  const now = new Date();

  const operations = entries.map((item) => {
    const group = groups.find(({ key }) => key === item.groupKey);
    const equivalents = group.idioms
      .map((idiom) => `${group.key}:${idiom.languageKey}`)
      .filter((seedKey) => seedKey !== item.seedKey)
      .map((seedKey) => ({
        equivalentId: idsByKey.get(seedKey),
        source: 0,
      }));
    const existingItem = existingByKey.get(item.seedKey);
    return {
      replaceOne: {
        filter: { _id: idsByKey.get(item.seedKey) },
        replacement: {
          _id: idsByKey.get(item.seedKey),
          partition: "1",
          slug: `demo-${item.groupKey}-${item.languageKey}`,
          title: item.title,
          description: item.meaning,
          tags: ["demo", "local-development", item.groupKey],
          equivalents,
          languageKey: item.languageKey,
          countryKeys: [item.countryKey],
          ...(item.literalTranslation
            ? { literalTranslation: item.literalTranslation }
            : {}),
          ...(item.transliteration
            ? { transliteration: item.transliteration }
            : {}),
          createdAt: existingItem?.createdAt || now,
          isDeleted: false,
          localSeed: seedName,
          localSeedKey: item.seedKey,
        },
        upsert: true,
      },
    };
  });

  await collection.bulkWrite(operations);
  await collection.deleteMany({
    localSeed: seedName,
    localSeedKey: { $nin: seedKeys },
  });

  console.log(
    `Seeded ${entries.length} idioms in ${groups.length} equivalence groups into ${databaseName}.${collectionName}.`,
  );
} finally {
  await client.close();
}

function entry(
  languageKey,
  countryKey,
  title,
  literalTranslation,
  transliteration,
) {
  return {
    languageKey,
    countryKey,
    title,
    literalTranslation,
    transliteration,
  };
}
