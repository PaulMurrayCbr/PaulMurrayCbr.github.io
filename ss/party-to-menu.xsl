<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
    <xsl:for-each select="/document/public//character">
		<div class="menuitem">
			<xsl:attribute name="data-menuitem"><xsl:value-of select="@name"/></xsl:attribute>
			<xsl:value-of select="@name"/>
		</div>
    </xsl:for-each>
</xsl:template>

</xsl:stylesheet> 