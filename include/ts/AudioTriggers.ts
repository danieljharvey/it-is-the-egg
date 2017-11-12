// AudioTriggers
// check old and new game state and trigger sounds from it

interface IAudioTrigger {
    name: string
    pan?: number
}

// diffs board changes and outputs list of sounds to play
export const findEatenThings = (oldBoard) => (board) : IAudioTrigger[] => {
    return []
}

