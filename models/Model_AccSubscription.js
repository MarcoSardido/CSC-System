class sellerType_Individual {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    };
};

class sellerType_Corporate {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    };
};


export {
    sellerType_Individual,
    sellerType_Corporate
}