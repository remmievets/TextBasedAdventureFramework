//Tags (Need implementation):
//[c] and [/c]: these tags signifies clickable text, whatever they encompasses can be clicked on and added to the input, also italicizes.
//[t]: this tag refers to whatever target the player tried to interact with, which is then inserted into the text at that position.

//define all the constant data
const data = {
    lookText: {
        //First testing room, the strange cabin?
        'strange cabin?': 'Observing your surroundings you find yourself in some sort of [c]strange cabin?[/c] \
        The cobwebs in the corners and the dust covering every surface make it clear no one has been here in years. \
        The room is sparse and windowless, large [c]oak door[/c] in the wall opposite you the only clear entrance. \
        To your left is a dusty [c]bed[/c] and adjacent is an equally dusty [c]nightstand[/c].',

        'oak key': 'This is an [c]oak key[/c], not carved out of wood but instead coated in bark like a branch. \
        Its twisted shape makes it seem almost naturally grown.',

        'oak door': {
            locked: "You called this an [c]oak door[/c] not because you recognize the grain or color of the wood, \
            but instead because the door visually appears similar to an oak tree. It is coated in a bark-like texture, \
            and it's only really discernable as a door due to the branch handle and its placement in the wall. \
            Tugging on the handle reveals the door is locked... or that this is a push door. Pushing on the door confirms the first theory. \
            Drat.",

            unlocked: "You called this an [c]oak door[/c] not because you recognize the grain or color of the wood, \
            but instead because the door visually appears similar to an oak tree. It is coated in a bark-like texture, \
            and it's only really discernable as a door due to the branch handle and its placement in the wall. \
            Thanks to the [c]oak key[/c] you used the door is unlocked. And revealed to be pulled open as you originally guessed, sweet!",
        },

        nightstand: 'This is a [c]nightstand[/c] containing an [c]oak key[/c].',

        bed: 'This is a [c]bed[/c]. It is moldy, enough so that you decide against sleeping in it. Or touching it.',
        
        //test item
        'test item': "This is a test item. You shouldn't see this dialog.",

        //Keep at the bottom of LookText
        invalid: "You look for the [t]. You can't find one anywhere nearby.",
    },
    takeText: {
        //Strange Cabin? testing text
        'oak key': 'Indeed! The [c]oak key[/c] looks extremely convienient and useful, \
        so naturally you grab it and add it to your inventory.',

        bed: "Mmm, no thanks. It wouldn't fit into your pocket and even if it did why would you want to keep a moldy [c]bed[/c]???",

        //Keep at the bottom of takeText
        invalid: "You cannot take the [t]. No matter how you try.",

        invalidRoom: "You cannot take the [c][t][/c]. Obviously! That's an entire room!",

        invalidInventory: "You CAN take the [c][t][/c]... you should know, considering you already did. \
        Look, it's in your inventory right now!",
    },
    useText: {
        //Strange cabin testing text
        'oak key': {
            default: "Sure, but a key is useless by itself. So use the [c]oak key[/c] on... what?",

            'oak door': 'You use the [c]oak key[/c] to open the [c]oak door[/c]. This breaks the [c]oak key[/c].',

            invalid: "The [c]oak key[/c] didn't seem to have any use with that.",

        },

        bed: "You aren't tired, and even if you were you'd rather sleep on the floor.",

        //Keep at the bottom of useText
        invalid: "You can't think of any uses for [t]. Must not be very useful.",

        invalidRoom: "Use the [c][t][/c]? For what, hosting a party?",
    },
}
    
//export it
if (typeof module === 'object') module.exports = data;
