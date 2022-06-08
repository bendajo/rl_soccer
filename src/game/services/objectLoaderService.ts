import {Scene, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export class ObjectLoaderService {
    public loadObject(path: string,
                      scene: Scene,
                      s: Vector3,
                      r: Vector3,
                      p: Vector3) {
        const loader = new GLTFLoader();
        loader.load(path+".gltf", function (obj) {
            let object = obj.scene
            scene.add(object)
            object.scale.set(s.x,s.y,s.z);
            object.rotation.set(r.x,r.y,r.z);
            object.position.set(p.x,p.y,p.z)
        }, this.onProgress, this.onError);
    }

    public onProgress(p: ProgressEvent){
        console.log("loading",p)
    }

    public onError(e: ErrorEvent){
        console.log("Error",e)
    }
}