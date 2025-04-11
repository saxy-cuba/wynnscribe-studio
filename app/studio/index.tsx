import {Button} from "~/components/ui/button";
import {useAuth} from "~/contexts/AuthContext";
import {useTranslation} from "react-i18next";
import {FaArrowRotateRight, FaArrowsRotate, FaCopy, FaDownload, FaLink, FaRegStar} from "react-icons/fa6";
import {toast} from "sonner";
import {FaRegComments} from "react-icons/fa";
import {apiClient} from "~/apiClient";
import {useState} from "react";

export default function Index() {
    const {isAdmin} = useAuth()
    const {t} = useTranslation()
    const [isExporting, setIsExporting] = useState(false)
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-bold text-2xl">{t("index.welcome.label")}</h2>
                <div className="grid grid-cols-3 gap-6">
                    <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <h2 className="font-bold flex flex-row gap-1 items-center"><FaRegStar />{t("index.welcome.wynnscribe.label")}</h2>
                        <div className="text-sm whitespace-pre-wrap text-foreground/80">{t("index.welcome.wynnscribe.description")}</div>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <h2 className="font-bold flex flex-row gap-1 items-center"><FaRegComments />{t("index.welcome.community.label")}</h2>
                        <div>
                            <div className="text-sm whitespace-pre-wrap text-foreground/80">{t("index.welcome.community.description")}</div>
                            <Button variant="link" className="text-[#5865F2]" onClick={()=>{navigator.clipboard.writeText("saxy_cuba").then(()=>{toast.success(t("index.welcome.community.copied"))})}}><FaCopy />{t("index.welcome.community.discord")}: @saxy_cuba</Button>
                            <Button variant="link" className="text-foreground" onClick={()=>{window.open("https://x.com/wynnscribe")}}><FaLink />{t("index.welcome.community.twitter")}: @wynnscribe</Button>
                        </div>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <h2 className="font-bold flex flex-row gap-1 items-center"><FaDownload />{t("index.welcome.mods.label")}</h2>
                        <div>
                            <div className="text-sm whitespace-pre-wrap text-foreground/80">{t("index.welcome.mods.description")}</div>
                            <div>
                                <Button variant="link" className="text-[#00af5c]" onClick={()=>{window.open("https://modrinth.com/mod/wynnscribe")}}><FaLink />{t("index.welcome.mods.modrinth.label")}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                isAdmin && (
                    <div className="flex flex-col gap-2">
                        <h2 className="font-bold text-2xl">{t("index.admin.label")}</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="border rounded-lg p-4 flex flex-col gap-2">
                                <h2 className="font-bold flex flex-row gap-1 items-center"><FaDownload />{t("index.admin.export.label")}</h2>
                                <div className="text-sm whitespace-pre-wrap text-foreground/80">{t("index.admin.export.description")}</div>
                                <div>
                                    <Button disabled={isExporting} onClick={()=>{
                                        setIsExporting(true)
                                        apiClient.POST("/api/v1/export", {
                                            body: {
                                                format: "json"
                                            }
                                        }).then((result) => {
                                            setIsExporting(false)
                                            if(!result.error) {
                                                toast.success(t("index.admin.export.exported"))
                                            } else {
                                                toast.error(t("index.admin.export.error"))
                                            }
                                        })
                                    }}>
                                        <FaArrowsRotate />{t("index.admin.export.run")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}