require('dotenv').config();
import mongoose, { Document,Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import  jwt  from "jsonwebtoken";
// const emailRegexPattern : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const emailRegexPattern: RegExp = /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]*\.[A-Za-z]{2,4}/;
// const emailRegexPattern: RegExp = /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]+"."[A-Za-z]{2,4}/;
// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailRegexPattern: RegExp = /^[^.]+@[^.]+\.[a-z]{2,3}$/;

var validateEmail = function(email: string) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{courseId : string}>;
    // courses: ICourse[];
    comparePassword: (password:string)=> Promise<boolean>;
    
    SignAccessToken: () => string;
    SignRefreshToken: () => string;

};

export const userSchema : Schema<IUser> = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter your name"],
    },
    email:{
        type: String,
        required:[true, "Please enter your email"],
        validate:{
            validator: function(value:string){
                return emailRegexPattern.test(value);
            },
            message: "please enter a valid email",
        },
        unique:true,
    },
    // email: {
    //     type: String,
    //     trim: true,
    //     lowercase: true,
    //     unique: true,
    //     required:[true, "Please enter your email"],
    //     validate: [validateEmail, 'Please fill a valid email address'],
    //     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    // },
    // email: {
    //     type: String,
    //     trim: true,
    //     lowercase: true,
    //     unique: true,
    //     validate: {
    //         validator: function(v: string) {
    //             return /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]*\.[A-Za-z]{2,4}/.test(v);
    //         },
    //         message: "Please enter a valid email"
    //     },
    //     required: [true, "Email required"]
    // },
    password:{
        type:String,
        minlength:[6, "Password must be at least 6 characters"],
        select:false,
    },
    avatar:{
          public_id: String,
          url:String,
    },
    role:{
        type:String,
        default: "user",
        // default: "User",
    },
    isVerified:{
        type:Boolean,
        default: false,
    },
    courses:[
        {
            courseId: String,

        }
    ],


},{timestamps:true}); 

//Hash Password before saving 
userSchema.pre<IUser>("save", async function(next){

    if(!this.isModified("password")){
       next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// sign access token 
userSchema.methods.SignAccessToken  = function(){
    return jwt.sign({id: this._id},process.env.ACCESS_TOKEN  || '',{
        expiresIn: "5m",
    });
};

//sign refresh token
userSchema.methods.SignRefreshToken  = function(){
    return jwt.sign({id: this._id},process.env.REFRESH_TOKEN  || '',{
        expiresIn: "3d",
    });
};


//compare password
userSchema.methods.comparePassword = async function(enteredPassword: string): Promise<boolean>{
return await bcrypt.compare(enteredPassword, this.password);
};

const userModel : Model<IUser> = mongoose.model("User", userSchema);

export default userModel;

