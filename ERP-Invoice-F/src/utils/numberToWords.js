export const numberToWords = (num) => {
  if (num === 0) return 'Zero';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const doubleDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const placeValues = ['', 'Thousand', 'Million', 'Billion'];

  let words = '';
  let i = 0;

  const helper = (n) => {
    if (n === 0) return '';
    else if (n < 10) return singleDigits[n] + ' ';
    else if (n < 20) return teenDigits[n - 10] + ' ';
    else if (n < 100) return doubleDigits[Math.floor(n / 10)] + ' ' + helper(n % 10);
    else return singleDigits[Math.floor(n / 100)] + ' Hundred ' + helper(n % 100);
  };

  const splitNum = num.toString().split('.');
  let integerPart = parseInt(splitNum[0]);
  let fractionalPart = splitNum[1] ? parseInt(splitNum[1].substring(0, 2)) : 0;

  let intWords = '';
  while (integerPart > 0) {
    if (integerPart % 1000 !== 0) {
      intWords = helper(integerPart % 1000) + placeValues[i] + ' ' + intWords;
    }
    integerPart = Math.floor(integerPart / 1000);
    i++;
  }

  words = intWords.trim();

  if (fractionalPart > 0) {
    words += ' and ' + helper(fractionalPart).trim() + ' Cents';
  }

  return words + ' Only';
};

// Indian numbering system version (Lakhs/Crores)
export const numberToWordsIndian = (num) => {
  if (num === 0) return 'Zero';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const doubleDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const helper = (n) => {
    let str = '';
    if (n > 99) {
      str += singleDigits[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += doubleDigits[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 9) {
      str += teenDigits[n - 10] + ' ';
    } else if (n > 0) {
      str += singleDigits[n] + ' ';
    }
    return str;
  };

  const splitNum = num.toString().split('.');
  let integerPart = parseInt(splitNum[0]);
  let fractionalPart = splitNum[1] ? parseInt(splitNum[1].substring(0, 2)) : 0;

  let res = '';
  if (integerPart >= 10000000) {
    res += helper(Math.floor(integerPart / 10000000)) + 'Crore ';
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) {
    res += helper(Math.floor(integerPart / 100000)) + 'Lakh ';
    integerPart %= 100000;
  }
  if (integerPart >= 1000) {
    res += helper(Math.floor(integerPart / 1000)) + 'Thousand ';
    integerPart %= 1000;
  }
  res += helper(integerPart);

  let finalWords = res.trim();

  if (fractionalPart > 0) {
    finalWords += ' and ' + helper(fractionalPart).trim() + ' Paise';
  }

  return finalWords + ' Only';
};
