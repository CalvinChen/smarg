# Smarg
Smarg is smart arguments.
Variable argument handling and validating in node.js.

## Code Rules
To use smarg, there are some common rules you'd better to follow.

- If your function has callback, the callback must be the last argument of the function.
- The params that your pass to your function must be not more than the function had expected. [error will be thrown]