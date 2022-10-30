<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<xsl:for-each select="/document/public/character">
			<div class="menupage" style="display: none;">
				<xsl:attribute name="data-menupage"><xsl:value-of select="@name"/></xsl:attribute>
				This is the character page for
				<xsl:value-of select="@name" />
				
				<div class="legal">
					<xsl:copy-of select="/document/public/program/programinfo/text()" />
				</div>
			</div>
		</xsl:for-each>
	</xsl:template>

</xsl:stylesheet> 