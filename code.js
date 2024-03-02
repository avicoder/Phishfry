// Contact button information
// Change this to your company security team mail address
var supportText = "Contact Security Team";
var supportLink = "mailto:team-security@comapny.com?subject=PhishFry+Plugin"; 

// Phish report messages
var reportPhishHeader = "Thanks for the report!";
var reportPhishMessage = "Thank you for helping keep <Company Name> safe!<br/><br/>Security Team may contact you if there is any follow-up required. <br/>";

// Report information
// Please assign an email address for reporting users who have encountered phishing emails.
var reportEmail = "report-phish@company.com";
var reportSubjectPrefix = "[Phishing Report] - <ENTER SUBJECT> ";

// Simulated phish testing information
var simulatedPhishText = "That was a simulated phishing attack, you caught it! 🎉<br/><br/>Thank you for your continuous effort in keeping [our company] safe!";
var simulatedPhishHeaders = []; // If your simulated phishing campaigns have unique email headers, fill them out here.

/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomepage(e) {
  var message = "Please open an email to report it.";
  return createPhishCardHomepage(message, true);
}

/**
 * Creates a card with information about the email(s) being submitted for phishing.
 */
function createPhishCardHomepage(text, isHomepage) {
  // Create a button that reports the opened, or selected, emails.
  // Note: Action parameter keys and values must be strings.
  var action = CardService.newAction()
      .setFunctionName('onReportPhishMulti')
      .setParameters({isHomepage: "true"});
  var button = CardService.newTextButton()
      .setText('Report a Phishing Mail')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);

  // Create a footer to be shown at the bottom.
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
          .setText(supportText)
          .setOpenLink(CardService.newOpenLink()
                       .setUrl(supportLink)));

  var message = CardService.newTextParagraph()
      .setText(text);

  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
      .addWidget(message);
  var card = CardService.newCardBuilder()
      .addSection(section)
      .setFixedFooter(footer);

  if (!isHomepage) {
    // Create the header shown when the card is minimized,
    // but only when this card is a contextual card. Peek headers
    // are never used by non-contexual cards like homepages.
    var peekHeader = CardService.newCardHeader()
      .setTitle('PhishFry')
      .setImageUrl('https://github.com/avicoder/Phishfry/blob/main/images/phish_logo.jpg?raw=true')
      .setSubtitle(text);
    card.setPeekCardHeader(peekHeader)
  }

  return card.build();
}

/**
 * Creates a card for reporting phishing.
 */
function createPhishCardReport(details) {
  var header = CardService.newCardHeader()
    .setTitle('Report this email?');
  
  // Create text input for optional comment.
  var input = CardService.newTextInput()
    .setFieldName('optional')
    .setTitle('What looks suspicious?')
    .setHint('Unfamiliar sender? Unexpected file? [OPTIONAL]');

  // Create a button that reports the opened, or selected, emails.
  // Note: Action parameter keys and values must be strings.
  var action = CardService.newAction()
      .setFunctionName('onReportPhish')
      .setParameters({details: JSON.stringify(details), isHomepage: "false"});
  var button = CardService.newTextButton()
      .setText('Send Report')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);

  // Create a footer to be shown at the bottom.
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
          .setText(supportText)
          .setOpenLink(CardService.newOpenLink()
           .setUrl(supportLink)));

  var reportDetails = CardService.newTextParagraph().setText("Is this email suspicious looking?" +
                                                            "<br/><b>Subject: </b>" + details['subject'] +
                                                            "<br/><b>Sender: </b>" + details['from']);

  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
      .addWidget(reportDetails)
      .addWidget(input)
      .addWidget(buttonSet);
  var card = CardService.newCardBuilder()
      .setHeader(header)
      .addSection(section)
      .setFixedFooter(footer);

  return card.build();
}

/**
 * Creates a card after reporting phishing.
 */
function createPhishCardPostReport(phishTest) {
  var header, thanks;
  
  if (phishTest) {
    header = CardService.newCardHeader()
      .setTitle(reportPhishHeader);
    thanks = CardService.newTextParagraph()
      .setText(simulatedPhishText);
  } else {
    header = CardService.newCardHeader()
      .setTitle(reportPhishHeader);
    thanks = CardService.newTextParagraph()
      .setText(reportPhishMessage);
  }
   
  // Create a footer to be shown at the bottom.
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
      .setText(supportText)
      .setOpenLink(CardService.newOpenLink()
      .setUrl(supportLink)));

  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
      .addWidget(thanks);
  var card = CardService.newCardBuilder()
      .setHeader(header)
      .addSection(section)
      .setFixedFooter(footer);

  return card.build();
}

/**
 * Callback for the "Report phish" button.
 */
function onReportPhish(e) {
  details = JSON.parse(e.parameters.details);
  var emailAsAttachment = Utilities.newBlob(details['original']);
  var headers = details['original'].split("\r\n\r\n")[0];
  
  if (!details['phishTest']) {
    GmailApp.sendEmail(reportEmail, reportSubjectPrefix + details['subject'], "Submitted email:\n\n" + details['plain'] + "\n\n\n\nEmail headers:\n\n" + headers, { attachments: [emailAsAttachment.setName(details.messageId + ".eml")], htmlBody: "<h2>Submitted email:</h2><br/><br/><pre>" + details['plain'] + "</pre><br/><br/><br/><h2>Email headers:</h2><br/><br/><pre>" + headers + "</pre>"});  
  } else {
    // no need to send email for a phishing test. 
  }
  // Create a new card with the same text.
  var card = createPhishCardPost

Report(details['phishTest']);

  // Create an action response that instructs the add-on to replace
  // the current card with the new one.
  var navigation = CardService.newNavigation()
      .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
      .setNavigation(navigation);
  return actionResponse.build();
}

/**
 * Callback for rendering the card for a specific Gmail message.
 * @param {Object} e The event object.
 * @return {CardService.Card} The card to show to the user.
 */
function onGmailMessage(e) {
  var reportDetails = {};
  
  // Get the ID of the message the user has open.
  var messageId = e.gmail.messageId;

  // Get an access token scoped to the current message and use it for GmailApp
  // calls.
  var accessToken = e.gmail.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  // Get the subject of the email.
  var message = GmailApp.getMessageById(messageId);
  var subject = message.getThread().getFirstMessageSubject();
  
  // Get some more mail information
  var from = message.getFrom();
  var original = message.getRawContent();
  var plain = message.getPlainBody();
  
  // Check if it's a phish test
  var phishTest = false;
  simulatedPhishHeaders.forEach(function(h) {
    if (message.getHeader(h) != "") {
      phishTest = true;
    }
  });
  
  // Remove labels and prefixes.
  subject = subject
      .replace(/^([rR][eE]|[fF][wW][dD])\:\s*/, '')
      .replace(/^\[.*?\]\s*/, '');

  reportDetails = {
    messageId: messageId,
    subject: subject,
    from: from,
    original: original,
    plain: plain,
    phishTest: phishTest
  };
  
  return createPhishCardReport(reportDetails);
}
