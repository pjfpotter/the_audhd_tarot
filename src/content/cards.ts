import type { CardText } from './types'

// The author's text, carried over from the v1 prototype. Edit wording here;
// src/content/v1.test.ts fails on any difference from content/v1-snapshot.json
// so that changes are deliberate.
export const cards: readonly CardText[] = [
  {
    number: 0,
    name: "The Fool",
    aliases: ["Le Mat", "The Defeated"],
    essence:
      "The already-defeated one who walks anyway — off the board, unnumbered, going again regardless of what the previous journeys cost.",
    question:
      "Which Fool is speaking? The Reckless one who mistakes returning energy for recovery, or the Whimsical one you've been trained to ignore?",
    unities: [
      {
        anchor: "Gaze upward",
        gift: "Lofty ideals, lifelong curiosity",
        shadow: "Body-blind; the drag back to material reality lands as shock",
      },
      {
        anchor: "The walking stick",
        gift: "Creative wand, the entertainer's instrument",
        shadow: "Cane covering the injuries of every previous start",
      },
      {
        anchor: "The bindle",
        gift: "Beginner's mind, the capacity to go again",
        shadow: "Failure to integrate; starting from zero every time",
      },
      {
        anchor: "Bells and motley",
        gift: "The satirist's real office, licence to say the unsayable",
        shadow: "Public exposure when the mask fails",
      },
      {
        anchor: "The open face",
        gift: "Radical trust, absence of defensive cynicism",
        shadow: "The Fool is also the one who can be fooled",
      },
    ],
  },
  {
    number: 1,
    name: "The Magician",
    aliases: ["Le Bateleur", "The Juggler"],
    essence:
      "The dazzling kid who's found the one place the world claps for a brain like theirs — and has spread every tool they own out on the table to prove it.",
    question:
      "Are you performing your intelligence because you love it, or because you've learned it's the only thing that gets you loved?",
    unities: [
      {
        anchor: "The table full of tools and objects",
        gift: "Genuine mastery — light-years ahead in the things you've chosen, and the joy of showing off what you know is real and infectious",
        shadow: "The tools become props in a performance rather than instruments of curiosity",
      },
      {
        anchor: "The confident, unmodest stance",
        gift: "A shameless, delighted belief in your own brilliance — rare, and worth protecting",
        shadow: "The identity fuses to being 'the clever one,' and curiosity gets replaced by the need to be seen as smart",
      },
      {
        anchor: "The hidden shyness under the showman's posture",
        gift: "A rich, private inner world that the performance is only the visible tip of",
        shadow: "Crushing self-doubt living in the same body as the swagger, at the same time, unresolved",
      },
    ],
  },
  {
    number: 2,
    name: "La Papesse",
    aliases: ["The High Priestess"],
    essence:
      "The one who found a whole universe inside her books and stopped needing the one outside — and honestly, why would she leave, when in here everything finally makes sense.",
    question:
      "Is the room peaceful because you're safe in it, or because you've stopped believing anywhere else could be?",
    unities: [
      {
        anchor: "The vivid, detailed crown against the plain backdrop",
        gift: "Total immersion — grokking a subject completely, building a rich internal world nobody else has access to",
        shadow: "The internal world becomes so much richer than the external one that reality stops looking worth the trip",
      },
      {
        anchor: "The books, the robed and covered figure",
        gift: "Deep-dive learning: fast, complete, genuinely joyful absorption in a subject",
        shadow: "A permanent research phase — perpetually preparing, never finishing, never bringing anything back out",
      },
      {
        anchor: "The pale, indoor stillness",
        gift: "Restfulness — a nervous system that has finally found somewhere it doesn't have to defend itself",
        shadow: "Cloistering as a permanent address instead of a place to visit",
      },
    ],
  },
  {
    number: 3,
    name: "The Empress",
    aliases: ["L'Impératrice"],
    essence:
      "The one who came alive after dark — fearless, magnetic, and finally, blessedly, unbothered by what anyone thinks of her.",
    question:
      "Is this power yours yet, or are you still just holding something enormous you haven't learned to carry?",
    unities: [
      {
        anchor: "The rising sceptre",
        gift: "Fearless directness that reads to everyone in the room as confidence — because it is confidence, no permission required",
        shadow: "The same all-in intensity that makes her magnetic doesn't know when to stop",
      },
      {
        anchor: "The half-formed phoenix",
        gift: "Enormous creative and sexual power, alive and growing",
        shadow: "Power not yet integrated — easier to be swept up by than to steer",
      },
      {
        anchor: "The night-time setting",
        gift: "The inversion: a world running on stamina, sensation and nerve instead of daytime rules, where she finally has the advantage",
        shadow: "A total absence of the shame mechanism others have internalised, which reads as fearlessness but leaves no built-in brakes",
      },
    ],
  },
  {
    number: 4,
    name: "The Emperor",
    aliases: ["L'Empereur"],
    essence:
      "The confident, put-together man everyone gets measured against — proof, mostly, of how much of 'normal' was never built with you in mind.",
    question:
      "Whose template are you trying to fit, and did anyone actually check it was built for a body like yours?",
    unities: [
      {
        anchor: "The grey hair, the full control",
        gift: "A genuinely useful mirror — naming him clearly is the first step to no longer absorbing him unconsciously",
        shadow: "You can name the whole game and still lose to it, because the daytime world is built in his image regardless",
      },
      {
        anchor: "The crossed but ready-to-stand legs",
        gift: "He shows you exactly what 'arrived' is supposed to look like, which is genuinely useful information",
        shadow: "Believing you should look like that in order to have arrived at all",
      },
      {
        anchor: "His stillness — he doesn't need to notice you to shape you",
        gift: "Once you see his power doesn't require your participation, you can stop performing for an audience that was never watching",
        shadow: "He's patient — waiting quietly through every clever workaround you think you've found",
      },
    ],
  },
  {
    number: 5,
    name: "Le Pape",
    aliases: ["The Hierophant", "The Pope"],
    essence:
      "The system that finally explained everything — and the sheer relief, for a pattern-hungry brain, of a cosmology that actually adds up.",
    question:
      "Did you find the truth, or did you find the first system rigid enough to feel like one?",
    unities: [
      {
        anchor: "The preaching stance, the sermon",
        gift: "The genuine gift of total commitment — understanding a framework deeply enough to live inside its logic completely",
        shadow: "Certainty mistaken for truth; not noticing when the framework you found is just another cage shaped like an answer",
      },
      {
        anchor: "The audience, the urge to share",
        gift: "If it's true, sharing it isn't dogmatism — it's generosity, and the urge to spread relief is a kind thing",
        shadow: "Not everyone is looking for the same complete system; urgency tips into missionary certainty",
      },
      {
        anchor: "The sacred framework itself",
        gift: "Finding rules that finally make internal sense, after years of rules that didn't, is real peace, hard-won",
        shadow: "Mistaking a system that tells you what's wrong with the world for one that tells you what's wrong with you",
      },
    ],
  },
  {
    number: 6,
    name: "The Lovers",
    aliases: ["Les Amoureux"],
    essence:
      "The moment the self meets the other — and finds out, against a lifetime of being told otherwise, that its people were out there all along.",
    question:
      "Are you loving with your whole depth, or building a fortress around one person and calling it love?",
    unities: [
      {
        anchor: "The two flanking figures pulling at the central one",
        gift: "An almost supernatural ability to find your people — even undiagnosed, even against the odds, your kind finds your kind",
        shadow: "Getting pulled between competing versions of who you 'should' be before you've worked out which voice is actually yours",
      },
      {
        anchor: "Eros above, piercing the heart",
        gift: "When you love, you love completely — deep, loyal, and rarer than most people ever get to experience",
        shadow: "The same completeness tips into fusing your whole identity to one person, and losing yourself in the process",
      },
      {
        anchor: "The figure still gazing at the mother while being claimed by the partner",
        gift: "Real emotional intensity and an enormous capacity for closeness",
        shadow: "Confusing the fantasy you've fixated on for the obvious, real signal standing right in front of you",
      },
    ],
  },
  {
    number: 7,
    name: "The Chariot",
    aliases: ["Le Chariot"],
    essence:
      "Three coffees in, firing on all cylinders, building something extraordinary while the rest of the world wonders how on earth you did it.",
    question:
      "Is this flow, or is this the fire you'll spend three days recovering from?",
    unities: [
      {
        anchor: "The armour",
        gift: "Feeling fully defended and certain — ready to build, ready to argue for what you're making, unstoppable in the moment",
        shadow: "The armour also stops anyone, including you, from noticing the cost building up underneath it",
      },
      {
        anchor: "The mismatched horses",
        gift: "The chosen-one feeling of a real flow state — brain moving fast, building huge complex patterns other brains can't touch",
        shadow: "The chariot isn't actually moving forward the way it looks; sprinting hard doesn't always mean travelling anywhere",
      },
      {
        anchor: "The smiling and sad faces on the shoulders",
        gift: "A theatrical, larger-than-life relationship with your own story — you get to be the hero",
        shadow: "The flip side of epic hero is epic failure, and there's rarely a middle setting",
      },
    ],
  },
  {
    number: 8,
    name: "Justice",
    aliases: ["La Justice"],
    essence:
      "The one who cannot let an unfair thing lie — because an open loop, once you've spotted the unfairness in it, does not close itself.",
    question:
      "Is this clarity serving the world, or is being right quietly becoming more important than being loved?",
    unities: [
      {
        anchor: "The sword",
        gift: "A sharp, rapid ability to map how systems empower some people and disempower others — genuinely useful, genuinely rare",
        shadow: "The same sharpness turned inward becomes a verdict on yourself: proof you're part of the machine you're angry at",
      },
      {
        anchor: "The scales",
        gift: "A real, principled refusal to look away from unfairness",
        shadow: "Losing interest in things — school, work, whole institutions — the moment you decide the game is rigged",
      },
      {
        anchor: "The steady, unflinching gaze",
        gift: "Conviction — once you've found your position, you hold it",
        shadow: "Holding it so hard it costs you the relationship, when being understood would have served you better than being right",
      },
    ],
  },
  {
    number: 9,
    name: "The Hermit",
    aliases: ["L'Hermite"],
    essence:
      "The one who's been through it, come out the other side with a lantern full of hard-won knowledge, and gone looking for someone to hand it to.",
    question:
      "Are you resting, or have you quietly decided the cave is safer than ever coming back out?",
    unities: [
      {
        anchor: "The lantern",
        gift: "Wisdom worth sharing — the wounded healer, turning your own hard road into something that lights someone else's",
        shadow: "Solitude prescribed as the cure can tip into isolation prescribed as the whole identity",
      },
      {
        anchor: "The walking stick",
        gift: "You've survived the damage and you're still walking, knowledge intact",
        shadow: "The injuries are real, and moving slowly doesn't mean they're healed",
      },
      {
        anchor: "The cloak",
        gift: "Recognising when your social battery needs recharging, and being unapologetic about taking it",
        shadow: "For the ADHD half of you, too much alone time doesn't recharge — it just gets lonely, quietly, without you clocking it",
      },
    ],
  },
  {
    number: 10,
    name: "Wheel of Fortune",
    aliases: ["La Roue de Fortune"],
    essence:
      "Licking your wounds just long enough before the itch to spin the wheel again gets too loud to ignore.",
    question:
      "Is the thrill of the spin calling you forward, or are you spinning because sitting still has started to feel unbearable?",
    unities: [
      {
        anchor: "The wheel itself",
        gift: "A genuine love of the game — the moment of adventure that makes you feel most alive, most switched-on, least alienated",
        shadow: "Crisis-seeking as a way of life; loving change so much you manufacture it even when things were fine",
      },
      {
        anchor: "The figures riding up and down",
        gift: "ADHD wired for exactly this: thriving in change, extremes, high stakes",
        shadow: "Autistic terror of the same unpredictability, pulling in the opposite direction at the same time",
      },
      {
        anchor: "The turning motion",
        gift: "The willingness to get back in the game after a real loss — real resilience, not denial",
        shadow: "Never spinning at all — staying in the Hermit's cave because the wheel feels too dangerous to touch",
      },
    ],
  },
  {
    number: 11,
    name: "Force",
    aliases: ["Strength", "La Force"],
    essence:
      "The quiet, staggering strength it takes just to run a brain like this — invisible to everyone who's never had to do it.",
    question:
      "Do you know how much internal labour you do every single day, or has it become so automatic you've stopped counting it as strength at all?",
    unities: [
      {
        anchor: "The calm face holding open the lion's mouth",
        gift: "An enormous, largely invisible daily strength — the sheer self-monitoring and regulation it takes to function, done without flinching",
        shadow: "Because it's invisible, nobody else clocks the cost either — including you, until you crash",
      },
      {
        anchor: "The lion itself",
        gift: "The power to channel raw, unruly energy — sexual, creative, whatever form it takes — into something directed and useful",
        shadow: "The refining takes real effort every time; it never becomes fully automatic no matter how practised you get",
      },
      {
        anchor: "The confidence in her expression",
        gift: "You know, better than most, that the internal work matters and has to be done",
        shadow: "Believing it's entirely on you to fix, alone, in the dark, without help",
      },
    ],
  },
  {
    number: 12,
    name: "The Hanged Man",
    aliases: ["Le Pendu"],
    essence:
      "Upside down by choice, waiting for the rope to break in its own time — not stuck, exactly, more like paused on purpose.",
    question:
      "Have you actually accepted being here, or are you performing acceptance while quietly furious you're still stuck?",
    unities: [
      {
        anchor: "The bent leg",
        gift: "A body finding its own rhythm even in stillness — a kind of stimming, a kind of self-regulation",
        shadow: "The stillness can be mistaken, by you and everyone else, for having no forward motion at all",
      },
      {
        anchor: "The hands tied behind the back",
        gift: "Sometimes surrender really is the move — accepting you can't force the next step and letting it come",
        shadow: "Time blindness means the same loop repeats without you noticing you've been here before",
      },
      {
        anchor: "The trees forming the frame",
        gift: "Growth still happening, even upside-down, even in the dark",
        shadow: "Pretending you're not stuck at all, and refusing to do the deep work that would actually free you",
      },
    ],
  },
  {
    number: 13,
    name: "Death",
    aliases: ["The Unnamed Arcanum", "Arcane Sans Nom"],
    essence:
      "Standing in the ruins of a chapter that's ending, grieving hard — and somewhere underneath the wreckage, already compost for what grows next.",
    question:
      "What are you refusing to cut away, and what would it cost you to keep it?",
    unities: [
      {
        anchor: "The black soil, la negrita",
        gift: "Reinvention — deliberately building a new version of yourself for the next phase of life, done consciously, again and again",
        shadow: "You spend real time wallowing in the black stuff before anything grows from it, and there's no shortcut through that part",
      },
      {
        anchor: "The severed, crowned heads",
        gift: "Even consciousness itself can be composted and regrown into something better",
        shadow: "We grieve longer and harder than most, and letting go, when it's time, is genuinely one of the hardest things we do",
      },
      {
        anchor: "The scythe",
        gift: "Real, decisive editing — cutting away what's not working instead of endlessly adding to it",
        shadow: "Reversed, this becomes refusing to simplify, refusing to let anything go, scope-creeping your own life",
      },
    ],
  },
  {
    number: 14,
    name: "Temperance",
    aliases: ["La Tempérance"],
    essence:
      "The angel who's learned, slowly and with real effort, how to let two different states of you flow into each other instead of crashing between them.",
    question:
      "Are you managing your energy, or just white-knuckling until the next crash?",
    unities: [
      {
        anchor: "The two jugs pouring into each other",
        gift: "Learning to move deliberately between nervous system states — upshifting, downshifting, on purpose rather than by accident",
        shadow: "It takes real, constant, unglamorous effort; it never becomes fully automatic",
      },
      {
        anchor: "The wings",
        gift: "A sustainable flow instead of a sprint — the version of productivity that doesn't cost three recovery days afterward",
        shadow: "Sustainable is quieter and less thrilling than the Chariot's rush, and can feel like giving something up",
      },
      {
        anchor: "The angel's calm expression",
        gift: "The decaf-coffee wisdom — small, unglamorous choices that protect you from your own excesses",
        shadow: "Easy to override in the moment when the Chariot's charge feels so much more exciting",
      },
    ],
  },
  {
    number: 15,
    name: "The Devil",
    aliases: ["Le Diable"],
    essence:
      "The one cast as the monster for refusing hierarchies that were never built to include you — creative, uncanny, and completely unbothered by being called wrong.",
    question:
      "Is this rebellion building something, or is it revenge dressed up as freedom?",
    unities: [
      {
        anchor: "The hermaphrodite figure",
        gift: "A carnal, whole embodiment of both — desire and identity refusing to be split down a line someone else drew",
        shadow: "Being cast as evil or dangerous just for existing outside the lines can curdle into believing it yourself",
      },
      {
        anchor: "The chained figures",
        gift: "Deep creative material lives in the parts of yourself that scare you, and going there is genuinely valuable work",
        shadow: "The same subconscious force that creates can also destroy, including turning on yourself",
      },
      {
        anchor: "The counter-cultural stance",
        gift: "Gleeful, genuine love of things 'normal' people hate — real joy in your own strange taste, no apology",
        shadow: "Sometimes the impulse isn't joy at all — it's exhaustion with masking curdling into a pure desire to burn it all down",
      },
    ],
  },
  {
    number: 16,
    name: "The Tower",
    aliases: ["La Maison Dieu"],
    essence:
      "The old self-image finally blown apart — painful, sudden, and the only reason the trapped energy underneath ever gets to move again.",
    question:
      "What system just collapsed, and what does it free you to build instead?",
    unities: [
      {
        anchor: "The falling figures",
        gift: "Hitting real ground is disorienting, but it's also the first honest information you've had in a long time",
        shadow: "The fall genuinely hurts, and recovery takes real time you can't rush",
      },
      {
        anchor: "The balls of colour raining down",
        gift: "Energy that was trapped in a system that wasn't serving you, finally released and available to use",
        shadow: "Release isn't gentle — it comes as catastrophe first, usefulness later",
      },
      {
        anchor: "The exploding tower itself",
        gift: "Sometimes the only way to get unstuck is for the whole structure to come down at once",
        shadow: "You don't get to choose the timing, and it rarely happens on a day you were ready for it",
      },
    ],
  },
  {
    number: 17,
    name: "The Star",
    aliases: ["L'Étoile"],
    essence:
      "A rare, earned moment of peace after the underworld — someone stroking your hair, telling you you've been very brave, and for once, you believe it.",
    question:
      "Can you let yourself rest here, or does part of you think peace has to be justified first?",
    unities: [
      {
        anchor: "Emptying the jugs into the river",
        gift: "Individual water joining collective water — your healing becoming part of something bigger than just you",
        shadow: "The peace is real but it's rare; the scanning brain doesn't stay quiet for long",
      },
      {
        anchor: "The soft light, the stars",
        gift: "For a meaning-hungry brain, this is the moment the veil rolls back and the universe's pattern becomes visible, whole, and kind",
        shadow: "You can't manufacture this moment on demand, no matter how much you want to",
      },
      {
        anchor: "The new growth in the background",
        gift: "Proof that healing is actually happening, visibly, after everything you've been through",
        shadow: "Easy to mistake one good night under the stars for having arrived, rather than one stop along the way",
      },
    ],
  },
  {
    number: 18,
    name: "The Moon",
    aliases: ["La Lune"],
    essence:
      "The secret school hidden after dark, where the softer, stranger, more unmasked version of you finally gets to come out and play.",
    question:
      "Is the night giving you rest, or somewhere to hide from a daytime you've given up on?",
    unities: [
      {
        anchor: "The crustacean in the water",
        gift: "Deep self-knowledge, right down to the oldest, least-verbal parts of the nervous system",
        shadow: "Some of what lives down there is genuinely hard to look at, and staying under too long has its own cost",
      },
      {
        anchor: "The dogs",
        gift: "The mammalian brain's own wisdom, softer and more intuitive than the daytime analytical mind",
        shadow: "The trap here is quiet and honest: forgetting to come back and live in the real world at all",
      },
      {
        anchor: "The moonlight itself",
        gift: "Moon child energy — a little fey, a little of the night, reclaimed as something to be proud of rather than pathologised",
        shadow: "The reduced demands of night-time are real relief, but they're not a substitute for daytime life",
      },
    ],
  },
  {
    number: 19,
    name: "The Sun",
    aliases: ["Le Soleil"],
    essence:
      "Staggering back out into the light after the underworld, wobbly, glowed-up, and unmistakably alive.",
    question:
      "What did you bring back with you, and are you ready to actually share it?",
    unities: [
      {
        anchor: "The two figures, one steadier than the other",
        gift: "Survivor joy — the exact, specific rush of powers coming back that you weren't sure would ever return",
        shadow: "One side of you still struggles while the other cheers it on; recovery isn't even across the whole system at once",
      },
      {
        anchor: "The tail on one figure",
        gift: "You made it out of the underworld and it shows — you've had a glow-up, and you've earned every bit of it",
        shadow: "Still a little wobbly on your feet; the recovery is real but not yet complete",
      },
      {
        anchor: "The warmth of the sun itself",
        gift: "This is the reason you come back to reality at all — good days, real people, new understanding worth sharing",
        shadow: "It would be easy to stay in the soft underworld forever; the Sun is the pull back that some part of you resists",
      },
    ],
  },
  {
    number: 20,
    name: "Judgement",
    aliases: ["Le Jugement"],
    essence:
      "The trumpet call for the thing you dragged back from the underworld — proof the internal work was never just for you.",
    question:
      "Is what you're bringing back part of something bigger, or is it still just for you?",
    unities: [
      {
        anchor: "The trumpet",
        gift: "Our need to find new things in the dark and bring them into the light is a genuine, valuable creative force — oppressed communities innovate because they have to",
        shadow: "You can make the whole underworld journey and still come back empty-handed; it's not entirely in your control",
      },
      {
        anchor: "The strange blue spirit",
        gift: "What gets born from this work is genuinely new — not expected, something the world hasn't seen before",
        shadow: "Something that strange and new can be hard for anyone, including you, to recognise as valuable at first",
      },
      {
        anchor: "The golden letterbox",
        gift: "The internal work finding an external, corporeal form — actually launching the thing rather than just discovering it",
        shadow: "It only completes if something bigger than you meets it halfway; you can't force the contract alone",
      },
    ],
  },
  {
    number: 21,
    name: "The World",
    aliases: ["Le Monde"],
    essence:
      "The whole journey held at once — every part of you, all four forces balanced, dancing at the centre of something genuinely, gorgeously whole.",
    question:
      "Can you hold the whole of what you are as one thing worth celebrating, rather than a set of parts to manage?",
    unities: [
      {
        anchor: "The four figures in the corners — angel, eagle, lion, ox",
        gift: "Every part of you — compassion, intellect, creative and sexual power, material stability — present and balanced at once",
        shadow: "Believing you need to keep them in perfect balance permanently, rather than letting them naturally take turns",
      },
      {
        anchor: "The wreath",
        gift: "Total, unapologetic creative and erotic power, worth celebrating rather than hiding",
        shadow: "A meaning-saturated universe is euphoric, but the pattern-hungry brain can just as easily flip into believing nothing means anything at all",
      },
      {
        anchor: "The dancing central figure",
        gift: "Bottom-up thinking's real gift — building up to the epic scale from the ground, rather than failing to see the big picture at all",
        shadow: "The scale of this vision can make ordinary daily life feel small and disappointing by comparison",
      },
    ],
  },
]
