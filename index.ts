import gm from 'gm';

// gm('./images/future.jpeg').write('./images/future.webp', (err) => console.log(err));
gm.compare('./images/future.jpeg', './images/future.webp', (err, isEqual, equality) => {
    console.log(equality);
    console.log(isEqual);
});