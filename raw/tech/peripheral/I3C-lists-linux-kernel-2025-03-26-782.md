> 来源: lists.openwall.net
> 原URL: https://lists.openwall.net/linux-kernel/2025/03/26/782
> 收集时间: 2026-05-01

# linux-kernel - [PATCH v2 0/3] Add Qualcomm i3c master controller driver support



linux-kernel - [PATCH v2 0/3] Add Qualcomm i3c master controller driver support

lists.openwall.net
&nbsp;

lists&nbsp;
/&nbsp;
announce&nbsp;
owl-users&nbsp;
owl-dev&nbsp;
john-users&nbsp;
john-dev&nbsp;
passwdqc-users&nbsp;
yescrypt&nbsp;
popa3d-users&nbsp;
/&nbsp;
oss-security&nbsp;
kernel-hardening&nbsp;
musl&nbsp;
sabotage&nbsp;
tlsify&nbsp;
passwords&nbsp;
/&nbsp;
crypt-dev&nbsp;
xvendor&nbsp;
/&nbsp;
Bugtraq&nbsp;
Full-Disclosure&nbsp;
linux-kernel&nbsp;
linux-netdev&nbsp;
linux-ext4&nbsp;
linux-hardening&nbsp;
linux-cve-announce&nbsp;
PHC&nbsp;

Open Source and information security mailing list archives
&nbsp;

Hash Suite: Windows password security audit tool. GUI, reports in PDF.

[&lt;prev] [next&gt;] [thread-next&gt;] [day] [month] [year] [list]

Message-Id: &lt;20250326141641.3471906-1-quic_msavaliy&#64;quicinc.com&gt;
Date: Wed, 26 Mar 2025 19:46:38 +0530
From: Mukesh Kumar Savaliya &lt;quic_msavaliy&#64;...cinc.com&gt;
To: alexandre.belloni&#64;...tlin.com, robh&#64;...nel.org, krzk+dt&#64;...nel.org,
conor+dt&#64;...nel.org, jarkko.nikula&#64;...ux.intel.com,
linux-i3c&#64;...ts.infradead.org, linux-arm-msm&#64;...r.kernel.org,
devicetree&#64;...r.kernel.org, linux-kernel&#64;...r.kernel.org
Cc: andersson&#64;...nel.org, konradybcio&#64;...nel.org,
Mukesh Kumar Savaliya &lt;quic_msavaliy&#64;...cinc.com&gt;
Subject: [PATCH v2 0/3] Add Qualcomm i3c master controller driver support

This patchset adds i3c controller support for the qualcomm's QUPV3 based
Serial engine (SE) hardware controller.

The I3C SE(Serial Engine) controller implements I3C master functionality
as defined in the MIPI Specifications for I3C, Version 1.0.

This patchset was tested on Kailua SM8550 MTP device and data transfer
has been tested in I3C SDR mode.

Features tested and supported :
Standard CCC commands.
I3C SDR mode private transfers in PIO mode.
I2C transfers in PIO mode.

Signed-off-by: Mukesh Kumar Savaliya &lt;quic_msavaliy&#64;...cinc.com&gt;
----
Link to v1: https://lore.kernel.org/lkml/20250205143109.2955321-1-quic_msavaliy&#64;quicinc.com/

Changes in V3:
- Removed bindings word from subject title of dt-bindings patch.
- Use Controller name instead of Master as per MIPI alliance guidance and updated title.
- Added description field for the i3c master into dt-bindings.
- Changed title to "Qualcomm Geni based QUP I3C Controller".
- Changed compatible to "qcom,i3c-master" matching dt-binding file and driver.
- Changed "interrupts-extended" property to "interrupts" as suggested by krzysztof.
- Dropped reg, clock minItems and added maxItems similar to other dt-bindings.
- Removed clock-names property from dt-bindings suggested by Krzysztof, Bjorn.
- Set "se-clock-frequency"  set it within drivers as suggested by Rob.
- Removed "dfs-index" property and manage it within driver as suggested by Rob.
- Removed "interrupts" maxItems as we need only 1 interrupt in this change.
- Added comment for mutex lock mentioning purpose in sruct geni_i3c_dev .
- Return with dev_err_probe() instead of error log and then return -ENXIO from probe().
- Removed dev_dbg(&amp;pdev-&gt;dev, "Geni I3C probed\n") print log as suggested by krzysztof.
- Removed CONFIG_PM and else part around runtime PM operations following other drivers.
- Removed Module alias MODULE_ALIAS("platform:geni_i3c_master").
- Replaced MASTER with GENI in the Title of MAINTAINER file.
- Removed duplications from the commit log and removed unwanted statement.
- Formatted license and copyright similar to other files.
- Removed SLV_ADDR_MSK and used FIELD_PREP/FIELD_GET instead of local bit shifting operations.
- Used direct bit positions for each internal Error bit of DM_I3C_CB_ERR.
- Removed Unused SLV_ADDR_MSK and added SLAVE_ADDR_MASK as GENMASK(15,9).
- Renamed spinlock as irq_lock.
- Removed dfs_idx from geni_i3c_dev and made it local inside qcom_geni_i3c_conf().
- Use boolean cur_is_write instead of enum i3c_trans_dir/gi3c-&gt;cur_rnw.
- Used DECLARE_BITMAP and related set/clear_bit APIs instead of manual operation.
- Inline the error messages from geni_i3c_err_log directly to improve readability
and avoid unnecessary jumps caused by the geni_i3c_err_code enum.
- Converted clk_src_freq of struct geni_i3c_clk_settings to HZ.
- Removed unwanted debug logs from geni_i3c_clk_map_idx().
- clk_od_fld and itr renamed to clk_od_idx and clk_idx respectively to map actual usage.
- Added se-clock-frequency to be read from DTSI, if none, then default to 100MHz source.
- Changed Error log during bus_init() if OD and PP mode frequencies avaiable or not.
- Used FIELD_PREP and standard BIT operations inside qcom_geni_i3c_conf() instead manual shifting.
- Removed unnecessary parentheses from geni_i3c_irq().
- Moved geni_se_abort_m_cmd() implementation to a new helper function geni_i3c_abort_xfer().
- Removed unwanted reinitialization of cur_len, cur_idx, cur_rnw from _i3c_geni_execute_command().
- Removed dev_dbg logs which were meant for developmental debug purpose.
- Removed unnecessary check nxfers &lt;= 0 from geni_i3c_master_priv_xfers().
- Replaced devm_kzalloc() by kzalloc() inside geni_i3c_master_attach_i2c_dev() to use
kfree() from counter function geni_i3c_master_detach_i2c_dev().
- Replaced devm_kzalloc() by kzalloc() inside geni_i3c_master_attach_i3c_dev() to use
kfree() from counter function geni_i3c_master_detach_i3c_dev().
- Removed geni_i3c_master_reattach_i3c_dev() function as default returns 0.
- Removed goto label from geni_i3c_master_bus_init() by reorganizing internal code.
Also used i3c_geni_runtime_get_mutex_lock()/unlock() instead of get_sync() similar to other places.
- Added indent to fallthrough for switch cases inside geni_i3c_master_supports_ccc_cmd().
- Renamed i3c_geni_rsrcs_init() to i3c_geni_resources_init().
- Changed devm_ioremap_resource() to devm_platform_ioremap_resource(), removed platform_get_resource().
- Replaced dev_err() with dev_err_probe() for core clock named se-clk.
- Removed development debug prints for votings from gi3c-&gt;se.icc_paths.
- Probe(): Changed all dev_err() to dev_error_probe() with proper log messages.
- Probe(): Moved static resource allocation immediately after gi3c object allocation.
- Probe(): Disabled PM if i3c master registration fails during probe().
- Remove(): Unregister master first and then added Disable of PM as opposite to probe().
- Removed I3C_CCC_ENTHDR support as it's not supported.
---
Mukesh Kumar Savaliya (3):
dt-bindings: i3c: Add Qualcomm I3C master controller
i3c: master: Add Qualcomm I3C controller driver
MAINTAINERS: Add maintainer for Qualcomm's I3C driver

.../bindings/i3c/qcom,i3c-master.yaml         |   60 +
MAINTAINERS                                   |    8 +
drivers/i3c/master/Kconfig                    |   12 +
drivers/i3c/master/Makefile                   |    1 +
drivers/i3c/master/qcom-i3c-master.c          | 1107 +++++++++++++++++
5 files changed, 1188 insertions(+)
create mode 100644 Documentation/devicetree/bindings/i3c/qcom,i3c-master.yaml
create mode 100644 drivers/i3c/master/qcom-i3c-master.c

--
2.25.1

Powered by blists - more mailing lists

