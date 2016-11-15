function getFirstWord(str) {
  if (str.indexOf(' ') === -1)
    return str;
  else
    return str.substr(0, str.indexOf(' '));
};

function removeFirstWord(str) {
	return original.substr(original.indexOf(" ") + 1);
}

module.exports = {
   getFirstWord,
   removeFirstWord
}