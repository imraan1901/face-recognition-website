'use client';
import { useState } from "react";
import { v4 } from "uuid";
import imageCompression from 'browser-image-compression';


const App = () => {

  const [selectedImage, setSelectedImage] = useState(null as unknown as File);
  const [filename, setFileName] = useState("");
  const [auth, setAuth] = useState(false);
  const [myText, setMyText] = useState("Click To Check Employee Status");

  // This function will be triggered when the file field changes
  const imageChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
      setAuth(false)
      setMyText("Click To Check Employee Status")
      setFileName(v4())
    }
  };


  async function handleImageUpload() {
  
    const options = {
      maxSizeMB: .1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    try {
      const compressedFile = await imageCompression(selectedImage, options);
      console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
      console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
  
      return compressedFile
    } catch (error) {
      console.log(error);
    }
  
  }

  async function submitToBackend() {
    setMyText(`Checking...`)
    let compressedFile = await handleImageUpload()
    let filenameQuery = encodeURIComponent(filename)

    let url = `https://2p47twxmsj.execute-api.us-west-1.amazonaws.com/dev/auth?filename=${filenameQuery}`
    const backendResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "image/*",
      },
      body: compressedFile,
    })
    //setName(await backendResponse.json())
    let resp = await backendResponse.json()
    console.log(resp)
    if (resp['Authenticated'] == true) {
      setAuth(true)
      setMyText(`Welcome ${resp['message'][0]} ${resp['message'][1]}!`)
    }
    else {
      setAuth(false)
      setMyText(`Employee not found`)
    }
  }

  return (
    <>
      <div style={styles.container as React.CSSProperties}>
        <h1 style={{"height" : "100px", "fontSize" : "30px", "alignItems": "center",}}>
          Employee Face Recognition App</h1>
        <h2 style={{"height" : "150px", "width" : "450px", "justifyContent" : "center"}}>I have added Cillian Murphy, Emily Blunt, Robert Downey-Jr., 
          Margot Robbie, Ryan Gosling, and Will Ferrell. Go ahead and find
          a jpg, jpeg, or png file of anyone one of those people to see if they are recognized.
          Also you can upload someone not in this list to see if they are not recognized.</h2>
        <input style={{"alignItems": "center", "justifyContent" : "center" }}
          accept=".jpg,.jpeg,.png"
          type="file"
          onChange={imageChange}
        />

        {selectedImage && (
          <div style={styles.preview as React.CSSProperties}>
            <button onClick={submitToBackend} style={auth ? styles.Approved : styles.Denied}>
              {myText}
            </button>
            <img
              src={URL.createObjectURL(selectedImage)}
              style={styles.image}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default App;

// Just some styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  preview: {
    marginTop: 50,
    display: "flex",
    flexDirection: "column",
  },
  image: { maxWidth: 500, maxHeight: 500 },
  Approved: {
    cursor: "pointer",
    padding: 15,
    background: "Green",
    color: "white",
    border: "none",
  },
  Denied: {
    cursor: "pointer",
    padding: 15,
    background: "Red",
    color: "white",
    border: "none",
  },
};