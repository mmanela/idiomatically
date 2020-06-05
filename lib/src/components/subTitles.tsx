const subTitles = [
  "Taking it with a grain of salt",
  "The horse of a different color",
  "The pot calling the kettle black",
  "Reaping what it sows",
  "The cart before the horse",
  "The perfect storm",
  "Letting the cat out of the bag",
  "The elephant in the room",
  "The penny for your thoughts",
  "Barking up the wrong tree",
  "On a wild goose chase",
  "Putting its eggs in one basket",
  "Crying over spilt milk",
  "Catching more flies with honey than with vinegar",
  "Looking before it leaps",
  "Saving up for a rainy-day", 
  "Looking in a gift horse's mouth" 
];

export const getSubTitle = () =>
  subTitles[Math.floor(Math.random() * subTitles.length)];
