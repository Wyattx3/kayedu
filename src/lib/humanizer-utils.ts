/**
 * Post-processing utilities for humanizing AI-generated text
 * These transformations are applied AFTER the AI generates text
 * to make it pass AI detection tools like GPTZero
 */

// Common AI phrases to replace
const AI_PHRASE_REPLACEMENTS: [RegExp, string[]][] = [
  // Formal transitions
  [/\bFurthermore,?\s*/gi, ["And ", "Plus ", "Also ", ""]],
  [/\bMoreover,?\s*/gi, ["And ", "Plus ", "Also ", ""]],
  [/\bAdditionally,?\s*/gi, ["And ", "Also ", "Plus ", ""]],
  [/\bHowever,\s*/gi, ["But ", "Though ", "Still ", ""]],
  [/\bNevertheless,?\s*/gi, ["But ", "Still ", "Even so ", ""]],
  [/\bConsequently,?\s*/gi, ["So ", "Because of this ", ""]],
  [/\bTherefore,?\s*/gi, ["So ", "That's why ", ""]],
  [/\bThus,?\s*/gi, ["So ", ""]],
  
  // Formal conclusions
  [/\bIn conclusion,?\s*/gi, ["So basically ", "Anyway ", "The point is ", "Look ", ""]],
  [/\bTo summarize,?\s*/gi, ["So basically ", "Anyway ", ""]],
  [/\bIn summary,?\s*/gi, ["So ", "Basically ", ""]],
  [/\bTo conclude,?\s*/gi, ["So ", "Anyway ", ""]],
  
  // AI filler phrases
  [/\bIt is important to note that\s*/gi, ["", "Look, ", "The thing is, "]],
  [/\bIt is worth noting that\s*/gi, ["", ""]],
  [/\bIt is worth mentioning that\s*/gi, ["", ""]],
  [/\bIt should be noted that\s*/gi, ["", ""]],
  [/\bIt can be argued that\s*/gi, ["", "I think ", "Some say "]],
  [/\bOne cannot deny that\s*/gi, ["Obviously ", "Clearly ", ""]],
  
  // Formal phrases
  [/\bIn today's world,?\s*/gi, ["These days ", "Now ", "Right now ", ""]],
  [/\bIn today's society,?\s*/gi, ["These days ", "Now ", ""]],
  [/\bIn the modern era,?\s*/gi, ["Now ", "These days ", ""]],
  [/\bIn this day and age,?\s*/gi, ["Now ", "These days ", ""]],
  
  // Overused AI words
  [/\butilize\b/gi, ["use"]],
  [/\butilizing\b/gi, ["using"]],
  [/\butilization\b/gi, ["use"]],
  [/\bleverage\b/gi, ["use", "tap into"]],
  [/\bfacilitate\b/gi, ["help", "make easier"]],
  [/\boptimize\b/gi, ["improve", "make better"]],
  [/\benhance\b/gi, ["improve", "boost"]],
  [/\baugment\b/gi, ["add to", "increase"]],
  [/\bascertain\b/gi, ["find out", "figure out"]],
  [/\bcommence\b/gi, ["start", "begin"]],
  [/\bterminate\b/gi, ["end", "stop"]],
  [/\bpurchase\b/gi, ["buy", "get"]],
  [/\brequire\b/gi, ["need"]],
  [/\bpossess\b/gi, ["have", "own"]],
  [/\bdemonstrate\b/gi, ["show", "prove"]],
  [/\bindicate\b/gi, ["show", "suggest"]],
  [/\bexhibit\b/gi, ["show", "have"]],
  
  // AI phrase patterns
  [/\bplays a crucial role\b/gi, ["is huge", "matters a lot", "is key"]],
  [/\bplays a vital role\b/gi, ["is huge", "is key", "matters"]],
  [/\bplays an important role\b/gi, ["matters", "is important", "counts"]],
  [/\bplays a significant role\b/gi, ["matters a lot", "is big", "is key"]],
  [/\ba myriad of\b/gi, ["lots of", "tons of", "many"]],
  [/\ba plethora of\b/gi, ["lots of", "tons of", "many"]],
  [/\ba multitude of\b/gi, ["lots of", "many", "tons of"]],
  [/\bin the realm of\b/gi, ["in", "for", "when it comes to"]],
  [/\bin terms of\b/gi, ["for", "about", "with"]],
  [/\bdelve into\b/gi, ["look at", "explore", "get into"]],
  [/\bembark on\b/gi, ["start", "begin", "go on"]],
  
  // Formal sentence starters
  [/^This essay will\s*/gim, ["I'm gonna ", "Let's ", "We'll "]],
  [/^This paper will\s*/gim, ["I'll ", "We'll ", "Let's "]],
  [/^As mentioned earlier,?\s*/gim, ["Like I said ", "Earlier ", ""]],
  [/^As previously stated,?\s*/gim, ["Like I said ", ""]],
];

// Contraction expansions to contract
const CONTRACTION_PATTERNS: [RegExp, string][] = [
  [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bwill not\b/gi, "won't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bcould not\b/gi, "couldn't"],
  [/\bshould not\b/gi, "shouldn't"],
  [/\bcan not\b/gi, "can't"],
  [/\bcannot\b/gi, "can't"],
  [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"],
  [/\bis not\b/gi, "isn't"],
  [/\bare not\b/gi, "aren't"],
  [/\bhas not\b/gi, "hasn't"],
  [/\bhave not\b/gi, "haven't"],
  [/\bhad not\b/gi, "hadn't"],
  [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"],
  [/\bwhat is\b/gi, "what's"],
  [/\bwho is\b/gi, "who's"],
  [/\bthere is\b/gi, "there's"],
  [/\bhere is\b/gi, "here's"],
  [/\bI am\b/g, "I'm"],
  [/\bI have\b/g, "I've"],
  [/\bI will\b/g, "I'll"],
  [/\bI would\b/g, "I'd"],
  [/\byou are\b/gi, "you're"],
  [/\byou have\b/gi, "you've"],
  [/\byou will\b/gi, "you'll"],
  [/\byou would\b/gi, "you'd"],
  [/\bwe are\b/gi, "we're"],
  [/\bwe have\b/gi, "we've"],
  [/\bwe will\b/gi, "we'll"],
  [/\bthey are\b/gi, "they're"],
  [/\bthey have\b/gi, "they've"],
  [/\bthey will\b/gi, "they'll"],
  [/\blet us\b/gi, "let's"],
  [/\bhe is\b/gi, "he's"],
  [/\bshe is\b/gi, "she's"],
  [/\bhe has\b/gi, "he's"],
  [/\bshe has\b/gi, "she's"],
  [/\bhe will\b/gi, "he'll"],
  [/\bshe will\b/gi, "she'll"],
  [/\bwho has\b/gi, "who's"],
  [/\bwho will\b/gi, "who'll"],
  [/\bwhat has\b/gi, "what's"],
  [/\bwhat will\b/gi, "what'll"],
  [/\bhow is\b/gi, "how's"],
  [/\bwhere is\b/gi, "where's"],
  [/\bwhen is\b/gi, "when's"],
  [/\bgoing to\b/gi, "gonna"],
  [/\bwant to\b/gi, "wanna"],
  [/\bgot to\b/gi, "gotta"],
  [/\bkind of\b/gi, "kinda"],
  [/\bsort of\b/gi, "sorta"],
  [/\bout of\b/gi, "outta"],
];

// Human filler phrases to randomly insert
const FILLER_PHRASES = [
  "honestly",
  "basically", 
  "I mean",
  "you know",
  "like",
  "pretty much",
  "kinda",
  "sort of",
  "to be honest",
  "the thing is",
  "look",
  "okay so",
  "here's the thing",
  "well",
  "anyway",
];

// Dramatic/emotional words to substitute
const DRAMA_REPLACEMENTS: [RegExp, string[]][] = [
  [/\bvery\b/gi, ["super", "really", "pretty", "totally", "insanely"]],
  [/\bextremely\b/gi, ["super", "crazy", "insanely", "ridiculously"]],
  [/\bsignificantly\b/gi, ["a lot", "way more", "seriously", "big time"]],
  [/\bimmediately\b/gi, ["right away", "instantly", "just like that"]],
  [/\bcurrently\b/gi, ["right now", "at the moment", "these days"]],
  [/\brecently\b/gi, ["lately", "just now", "not long ago"]],
  [/\bfrequently\b/gi, ["a lot", "all the time", "pretty often"]],
  [/\boccasionally\b/gi, ["sometimes", "now and then", "once in a while"]],
  [/\bpreviously\b/gi, ["before", "earlier", "back then"]],
  [/\bsubsequently\b/gi, ["then", "after that", "later"]],
  [/\bhowever\b/gi, ["but", "though", "still"]],
  [/\btherefore\b/gi, ["so", "that's why"]],
  [/\bnevertheless\b/gi, ["still", "but", "even so"]],
  [/\bfurthermore\b/gi, ["and", "plus", "also"]],
  [/\bmoreover\b/gi, ["and", "plus", "on top of that"]],
  [/\badditionally\b/gi, ["also", "and", "plus"]],
];

// Sentence starters to add variety
const SENTENCE_STARTERS = [
  "So ",
  "And ",
  "But ",
  "Look, ",
  "Honestly, ",
  "The thing is, ",
  "Here's the deal: ",
  "I mean, ",
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shouldApply(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Replace AI phrases with human alternatives
 */
function replaceAIPhrases(text: string): string {
  let result = text;
  
  for (const [pattern, replacements] of AI_PHRASE_REPLACEMENTS) {
    result = result.replace(pattern, () => randomChoice(replacements));
  }
  
  // Also apply dramatic word replacements
  for (const [pattern, replacements] of DRAMA_REPLACEMENTS) {
    result = result.replace(pattern, () => randomChoice(replacements));
  }
  
  return result;
}

/**
 * Add contractions to make text more casual
 */
function addContractions(text: string): string {
  let result = text;
  
  for (const [pattern, replacement] of CONTRACTION_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

/**
 * Add human filler words and phrases - more aggressive
 */
function addFillerPhrases(text: string, intensity: "light" | "balanced" | "heavy"): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const probability = intensity === "heavy" ? 0.4 : intensity === "balanced" ? 0.2 : 0.08;
  
  const processed = sentences.map((sentence, index) => {
    // Skip very short sentences
    if (sentence.length < 25) return sentence;
    
    // Add filler at start of some sentences
    if (shouldApply(probability) && index > 0) {
      const filler = randomChoice(FILLER_PHRASES);
      const rest = sentence.charAt(0).toLowerCase() + sentence.slice(1);
      return `${filler.charAt(0).toUpperCase() + filler.slice(1)}, ${rest}`;
    }
    
    // Add sentence starters to some sentences
    if (shouldApply(probability * 0.6) && index > 0 && !sentence.match(/^[A-Z][a-z]+,/)) {
      const starter = randomChoice(SENTENCE_STARTERS);
      const rest = sentence.charAt(0).toLowerCase() + sentence.slice(1);
      return `${starter}${rest}`;
    }
    
    return sentence;
  });
  
  // Add some short reactions/interjections between sentences
  const withReactions: string[] = [];
  const reactions = ["Right?", "Crazy.", "Wild.", "Seriously.", "No joke.", "True."];
  
  for (let i = 0; i < processed.length; i++) {
    withReactions.push(processed[i]);
    // Add reaction after some sentences (but not the last one)
    if (i < processed.length - 1 && shouldApply(intensity === "heavy" ? 0.1 : 0.03)) {
      withReactions.push(randomChoice(reactions));
    }
  }
  
  return withReactions.join(" ");
}

/**
 * Break up long sentences for burstiness - more aggressive
 */
function addBurstiness(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const result: string[] = [];
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    // More aggressively break long sentences at commas
    if (sentence.length > 60 && sentence.includes(",") && shouldApply(0.5)) {
      const parts = sentence.split(/,\s*/);
      if (parts.length >= 2) {
        const firstPart = parts[0] + ".";
        const rest = parts.slice(1).join(", ");
        result.push(firstPart);
        if (rest.trim()) {
          result.push(rest.charAt(0).toUpperCase() + rest.slice(1));
        }
        continue;
      }
    }
    
    // Break at "and" or "but" in long sentences
    if (sentence.length > 80 && shouldApply(0.4)) {
      const andMatch = sentence.match(/^(.{30,}?)\s+(and|but)\s+(.+)$/i);
      if (andMatch) {
        result.push(andMatch[1] + ".");
        const connector = andMatch[2].charAt(0).toUpperCase() + andMatch[2].slice(1);
        result.push(connector + " " + andMatch[3]);
        continue;
      }
    }
    
    result.push(sentence);
  }
  
  return result.join(" ");
}

/**
 * Add parenthetical asides for personality
 */
function addAsides(text: string, intensity: "light" | "balanced" | "heavy"): string {
  const probability = intensity === "heavy" ? 0.15 : intensity === "balanced" ? 0.08 : 0.03;
  
  const asides = [
    "(which is pretty wild)",
    "(honestly)",
    "(if you think about it)",
    "(I think)",
    "(or something like that)",
    "(you know?)",
    "(right?)",
    "(at least in my opinion)",
  ];
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  const processed = sentences.map((sentence) => {
    if (sentence.length > 50 && shouldApply(probability)) {
      // Insert aside before the period
      const aside = randomChoice(asides);
      return sentence.replace(/([.!?])$/, ` ${aside}$1`);
    }
    return sentence;
  });
  
  return processed.join(" ");
}

/**
 * Simplify complex words to basic English (novel style)
 */
function simplifyVocabulary(text: string): string {
  const simplifications: [RegExp, string][] = [
    // Complex -> Simple
    [/\bnevertheless\b/gi, "but still"],
    [/\bnonetheless\b/gi, "but still"],
    [/\bfurthermore\b/gi, "and"],
    [/\bmoreover\b/gi, "also"],
    [/\badditionally\b/gi, "also"],
    [/\bconsequently\b/gi, "so"],
    [/\bsubsequently\b/gi, "then"],
    [/\bpreviously\b/gi, "before"],
    [/\bsimultaneously\b/gi, "at the same time"],
    [/\bapproximately\b/gi, "about"],
    [/\bsignificantly\b/gi, "a lot"],
    [/\bimmediately\b/gi, "right away"],
    [/\boccasionally\b/gi, "sometimes"],
    [/\bfrequently\b/gi, "often"],
    [/\bcurrently\b/gi, "now"],
    [/\bpresently\b/gi, "now"],
    [/\bultimately\b/gi, "in the end"],
    [/\binitially\b/gi, "at first"],
    [/\bprimarily\b/gi, "mainly"],
    [/\bextremely\b/gi, "very"],
    [/\bparticularly\b/gi, "especially"],
    [/\bspecifically\b/gi, "exactly"],
    [/\bessentially\b/gi, "basically"],
    [/\bfundamentally\b/gi, "basically"],
    [/\bdemonstrate\b/gi, "show"],
    [/\billustrate\b/gi, "show"],
    [/\bindicate\b/gi, "show"],
    [/\bexhibit\b/gi, "show"],
    [/\butilize\b/gi, "use"],
    [/\bimplement\b/gi, "use"],
    [/\bfacilitate\b/gi, "help"],
    [/\bachieve\b/gi, "get"],
    [/\bobtain\b/gi, "get"],
    [/\bacquire\b/gi, "get"],
    [/\bpurchase\b/gi, "buy"],
    [/\bcommence\b/gi, "start"],
    [/\binitiate\b/gi, "start"],
    [/\bterminate\b/gi, "end"],
    [/\bconclude\b/gi, "end"],
    [/\brequire\b/gi, "need"],
    [/\bnecessitate\b/gi, "need"],
    [/\bpossess\b/gi, "have"],
    [/\bcomprehend\b/gi, "understand"],
    [/\bperceive\b/gi, "see"],
    [/\bobserve\b/gi, "see"],
    [/\bexamine\b/gi, "look at"],
    [/\binvestigate\b/gi, "look into"],
    [/\bascertain\b/gi, "find out"],
    [/\bdetermine\b/gi, "find out"],
    [/\bestablish\b/gi, "set up"],
    [/\bcommunicate\b/gi, "talk"],
    [/\bconverse\b/gi, "talk"],
    [/\bdisclose\b/gi, "tell"],
    [/\breveal\b/gi, "show"],
    [/\battempt\b/gi, "try"],
    [/\bendeavor\b/gi, "try"],
    [/\bmodify\b/gi, "change"],
    [/\balter\b/gi, "change"],
    [/\btransform\b/gi, "change"],
    [/\benhance\b/gi, "improve"],
    [/\baugment\b/gi, "add to"],
    [/\bdiminish\b/gi, "reduce"],
    [/\bdecrease\b/gi, "reduce"],
    [/\beliminate\b/gi, "remove"],
    [/\beradicate\b/gi, "remove"],
    [/\bsufficient\b/gi, "enough"],
    [/\badequate\b/gi, "enough"],
    [/\bsubstantial\b/gi, "big"],
    [/\bconsiderable\b/gi, "big"],
    [/\bnumerous\b/gi, "many"],
    [/\bvarious\b/gi, "different"],
    [/\bdiverse\b/gi, "different"],
    [/\bidentical\b/gi, "the same"],
    [/\bsimilar\b/gi, "like"],
    [/\bdistinct\b/gi, "different"],
    [/\bunique\b/gi, "special"],
    [/\bsignificant\b/gi, "important"],
    [/\bcrucial\b/gi, "important"],
    [/\bvital\b/gi, "important"],
    [/\bessential\b/gi, "needed"],
    [/\bnecessary\b/gi, "needed"],
    [/\bbeneficial\b/gi, "good"],
    [/\bdetrimental\b/gi, "bad"],
    [/\badverse\b/gi, "bad"],
    [/\bappropriate\b/gi, "right"],
    [/\bsuitable\b/gi, "right"],
    [/\baccurate\b/gi, "correct"],
    [/\bprecise\b/gi, "exact"],
    [/\brapid\b/gi, "fast"],
    [/\bswift\b/gi, "fast"],
    [/\bgradual\b/gi, "slow"],
  ];
  
  let result = text;
  for (const [pattern, replacement] of simplifications) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Main humanization function - PURE SIMPLIFICATION approach
 * NO filler words, NO reactions - just simplify and shorten
 * This is what works to bypass GPTZero
 */
export function humanizeText(text: string, intensity: "light" | "balanced" | "heavy" = "heavy"): string {
  let result = text;
  
  // Step 1: Remove ALL formal transitions (replace with nothing or simple)
  result = replaceAIPhrases(result);
  
  // Step 2: Simplify vocabulary to 8th grade level
  result = simplifyVocabulary(result);
  
  // Step 3: Add contractions (critical)
  result = addContractions(result);
  
  // Step 4: Break long sentences (novel style = short sentences)
  if (intensity === "heavy" || intensity === "balanced") {
    result = addBurstiness(result);
  }
  
  // NO filler words - that's also AI detectable!
  // NO reactions - that's also AI detectable!
  // NO parenthetical asides - that's also AI detectable!
  
  // Clean up extra spaces
  result = result.replace(/\s+/g, " ").trim();
  
  return result;
}

/**
 * Generate diff HTML showing changes
 */
export function humanizeWithDiff(originalText: string, intensity: "light" | "balanced" | "heavy" = "heavy"): { html: string; plain: string } {
  const humanized = humanizeText(originalText, intensity);
  
  // Simple word-level diff
  const originalWords = originalText.split(/\s+/);
  const humanizedWords = humanized.split(/\s+/);
  
  // Create a set of original words for quick lookup
  const originalSet = new Set(originalWords.map(w => w.toLowerCase().replace(/[.,!?;:]/g, "")));
  
  // Mark words that are new or changed
  const htmlWords = humanizedWords.map(word => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "");
    if (!originalSet.has(cleanWord) && cleanWord.length > 2) {
      return `<span class="text-green-600 font-medium">${word}</span>`;
    }
    return word;
  });
  
  return {
    html: htmlWords.join(" "),
    plain: humanized,
  };
}
