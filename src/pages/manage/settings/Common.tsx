import { MaybeLoading } from "~/components";
import { useFetch, useT, useRouter, useManageTitle } from "~/hooks";
import { Group, SettingItem, Resp } from "~/types";
import { r, notify, getTarget } from "~/utils";
import { createStore } from "solid-js/store";
import { Button } from "@hope-ui/solid";
import { createSignal, Index } from "solid-js";
import { Item } from "./SettingItem";
import { ResponsiveGrid } from "../ResponsiveGrid";

export interface CommonSettingsProps {
  group: Group;
}
const CommonSettings = (props: CommonSettingsProps) => {
  const t = useT();
  const { pathname } = useRouter();
  useManageTitle(`manage.sidemenu.${pathname().split("/").pop()}`);
  const [settingsLoading, getSettings] = useFetch(() =>
    r.get(`/admin/setting/list?group=${props.group}`)
  );
  const [settings, setSettings] = createStore<SettingItem[]>([]);
  const refresh = async () => {
    const resp: Resp<SettingItem[]> = await getSettings();
    if (resp.code === 200) {
      setSettings(resp.data);
    } else {
      notify.error(resp.message);
    }
  };
  refresh();
  const [saveLoading, saveSettings] = useFetch(() =>
    r.post("/admin/setting/save", getTarget(settings))
  );
  const [loading, setLoading] = createSignal(false);
  return (
    <MaybeLoading loading={settingsLoading() || loading()}>
      <ResponsiveGrid>
        <Index each={settings}>
          {(item, _) => (
            <Item
              {...item()}
              onChange={(val) => {
                setSettings((i) => item().key === i.key, "value", val);
              }}
              onDelete={async () => {
                setLoading(true);
                const resp: Resp<{}> = await r.post(
                  `/admin/setting/delete?key=${item().key}`
                );
                setLoading(false);
                if (resp.code === 200) {
                  notify.success(t("global.delete_success"));
                  refresh();
                } else {
                  notify.error(resp.message);
                }
              }}
            />
          )}
        </Index>
      </ResponsiveGrid>
      <Button
        mt="$2"
        loading={saveLoading()}
        onClick={async () => {
          console.log(settings);
          const resp: Resp<{}> = await saveSettings();
          if (resp.code === 200) {
            notify.success(t("global.save_success"));
          } else {
            notify.error(resp.message);
          }
        }}
      >
        {t("global.save")}
      </Button>
    </MaybeLoading>
  );
};

export default CommonSettings;
