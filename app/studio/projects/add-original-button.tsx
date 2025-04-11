import {FiPlus} from "react-icons/fi";
import {Button} from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "~/components/ui/dialog";
import "../editor.css"
import "../editor-bordered.css"
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {useAuth} from "~/contexts/AuthContext";
import AddOriginalForm from "~/studio/projects/add-original-form";
import {useProjects} from "~/contexts/ProjectContext";

export default function AddOriginalButton() {
    const [isOpen, setIsOpen] = useState(false)

    const {selectedProjectId} = useProjects()
    const {isAdmin} = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const defaultOriginalValues = searchParams.get("defaultOriginalValues")

    useEffect(() => {
        if(isAdmin && defaultOriginalValues) {
            setIsOpen(true)
        }
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={(event)=>{
            if(!event) {
                searchParams.delete("defaultOriginalValues")
                searchParams.delete("withProject")
                setSearchParams(searchParams)
            }
            setIsOpen(event)
        }}>
            <DialogTrigger asChild>
                <Button type="button" size="icon" variant="secondary"><FiPlus/></Button>
            </DialogTrigger>
            <DialogContent>
                <AddOriginalForm defaultProjectId={selectedProjectId} openDefault={false} parentId={undefined} />
            </DialogContent>
        </Dialog>
    )
}