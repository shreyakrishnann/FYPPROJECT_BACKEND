const express = require('express');
const app = express();
const UserModel = require('./UserModel');
const AcBrandModel = require('./BrandModel');
const ReviewModel = require('./ReviewModel');
const cors = require('cors');
const acdata = require('./acdata.json');
const bodyParser = require('body-parser');


app.use(cors());
app.use(bodyParser.json());

const corsOptions = {
    origin: ['http://localhost:3000'],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const connectiondb = require('./dbconnection');

connectiondb();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new UserModel({
            email,
            password,
        });
        const saveUser = await user.save();
        if (saveUser) {
            return res.status(200).json({ message: 'Success' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    try {
        let user = await UserModel.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if (password !== user.password) {
            console.log('Wrong Password');
            return res.status(400).json({ message: 'Wrong Password' });
        }

        res.status(200).json({ id: user._id });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/* AC Details */
app.post('/ac-details', async (req, res) => {
    try {

        const { brandName, acconditioner, price, rating, energyconsumption, image, description, reviews } = req.body;
        if (!brandName || !price || !acconditioner || !image ||  !rating || !energyconsumption) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newBrand = new AcBrandModel({
            brandName,
            acconditioner,
            price,
            rating,
            energyconsumption,
            image,
            description,
            reviews: reviews || []
        });

        const savedBrand = await newBrand.save();
        res.status(201).json({ savedBrand });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/ac-details', async (req, res) => {

    try {
        const brands = await AcBrandModel.find();
        const reviews = await ReviewModel.find();

        brands.forEach(brand => {
            brand.reviews = reviews.filter(review => review.brand.toString() === brand._id.toString());
        });


        if (brands && brands.length > 0) {
            return res.status(200).json(brands);
        }
        res.status(404).json({ message: 'No AC Details found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

})

app.get('/ac-details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await AcBrandModel.findById(id);

        const reviews = await ReviewModel.find({ brand: id });

        const completedBrand = {
            ...brand._doc,
            reviews
        };

        if (brand) {
            return res.status(200).json(completedBrand);
        }
        res.status(404).json({ message: 'No AC Details found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.delete('/ac-details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBrand = await AcBrandModel.findByIdAndDelete(id);
        if (deletedBrand) {
            return res.status(200).json({ message: 'AC Details deleted successfully' });
        }
        res.status(404).json({ message: 'No AC Details found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
/* AC Details */


/* Review  */

// POST API to add a new review
app.post('/createreviews', async (req, res) => {
    try {
        const { comment, brandId, userId } = req.body;

        // Validate required fields
        if (!comment || !brandId) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const userEmail = await UserModel.findById(userId);

        const review = new ReviewModel({
            comment,
            brand: brandId,
            userEmail: userEmail.email
        });

        const savedReview = await review.save();

        // Also, add this review to the corresponding brand
        await AcBrandModel.findByIdAndUpdate(brandId, { $push: { reviews: savedReview._id } });

        res.status(201).json({ savedReview });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE API to delete a review by ID
app.delete('/deletereview/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the review
        const review = await ReviewModel.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Remove the review ID from the associated brand's reviews array
        await AcBrandModel.findByIdAndUpdate(review.brand, { $pull: { reviews: id } });

        // Delete the review
        await ReviewModel.findByIdAndDelete(id);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/* Review  */


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));