const randomstring = require("randomstring");
const fs = require('fs');

const createDir = (targetDir) => {
    const path = require('path');
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(parentDir, childDir);
        if (!fs.existsSync(curDir)) {
            fs.mkdirSync(curDir);
        }
        return curDir;
    }, initDir);
}

uploadProfileImg = (req, next) => {
    
    if (req.files && req.files.profile_img) {

        let sampleFile;
        let uploadPath;
        let profileImgName = randomstring.generate(8);
        let ext;

        if (req.files.profile_img.mimetype == "application/pdf") {
            ext = '.pdf';
        }
        if (req.files.profile_img.mimetype == "image/jpeg" || req.files.profile_img.mimetype == "image/jpg") {
            ext = '.jpg';
        }
        if (req.files.profile_img.mimetype == "image/png") {
            ext = '.png';
        }

        sampleFile = req.files.profile_img;
        uploadPath = './uploads/profileImg/' + profileImgName + ext;
        createDir('./uploads/profileImg/');

        sampleFile.mv(uploadPath, (err) => {
            if (err) {
                next(err, null);
            }
            else {
                console.log('\n\nPROFILE IMAGE NAME', profileImgName + ext);
                next(null, '/profileImg/' + profileImgName + ext);
            }
        })
    }
    else {
        console.log('\n\nNO PROFILE IMAGE\n\n');
        next(null, null);
    }

}

module.exports = {
    uploadProfileImg,
    createDir,
};